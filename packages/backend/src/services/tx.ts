import {
  generalError,
  getTxEnricher,
  getTxsEnricher,
  handleError,
  PostTxDecoder,
  PostTxsUploadDecoder,
  type AssetId,
  type EnrichedTx,
  type GetAsset,
  type Id,
  type Optional,
  type PortfolioId,
  type TxId,
  type UserId,
  type YahooApi
} from "@darkruby/assets-core";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import type { WebAction } from "@darkruby/fp-express";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import { mapWebError } from "../domain/error";
import type { Repository } from "../repository";

const txDecoder = liftTE(PostTxDecoder);
const txUploadDecoder = liftTE(PostTxsUploadDecoder);

const assetGetterHelper = (
  repo: Repository,
  assetId: AssetId,
  portfolioId: PortfolioId,
  userId: UserId
) => {
  return () =>
    pipe(
      repo.asset.get(assetId, portfolioId, userId),
      TE.mapLeft(handleError()),
      TE.filterOrElse(
        (x): x is GetAsset => Boolean(x),
        () => generalError(`asset not found`)
      )
    );
};

export const getTx =
  (repo: Repository, yahooApi: YahooApi) =>
  (
    txId: TxId,
    assetId: AssetId,
    portfolioId: PortfolioId,
    userId: UserId
  ): WebAction<Optional<EnrichedTx>> => {
    const txEnricher = getTxEnricher(yahooApi);
    const getAsset = assetGetterHelper(repo, assetId, portfolioId, userId);
    const enrichTx = txEnricher(getAsset);
    return pipe(
      repo.tx.get(txId, assetId, userId),
      TE.chain((tx) => (tx ? enrichTx(tx) : TE.of(null))),
      mapWebError
    );
  };

export const getTxs =
  (repo: Repository, yahooApi: YahooApi) =>
  (
    assetId: AssetId,
    portfolioId: PortfolioId,
    userId: UserId
  ): WebAction<readonly EnrichedTx[]> => {
    const txsEnricher = getTxsEnricher(yahooApi);
    const getAsset = assetGetterHelper(repo, assetId, portfolioId, userId);
    const enrichTxs = txsEnricher(getAsset);

    return pipe(
      repo.tx.getAll(assetId, userId),
      TE.chain(enrichTxs),
      mapWebError
    );
  };

export const createTx =
  (repo: Repository, yahooApi: YahooApi) =>
  (
    assetId: AssetId,
    portfolioId: PortfolioId,
    userId: UserId,
    payload: unknown
  ): WebAction<EnrichedTx> => {
    const txEnricher = getTxEnricher(yahooApi);
    const getAsset = assetGetterHelper(repo, assetId, portfolioId, userId);
    const enrichTx = txEnricher(getAsset);
    return pipe(
      txDecoder(payload),
      TE.chain((tx) => repo.tx.create(tx, assetId, userId)),
      TE.chain(enrichTx),
      mapWebError
    );
  };

export const updateTx =
  (repo: Repository, yahooApi: YahooApi) =>
  (
    txId: TxId,
    assetId: AssetId,
    portfolioId: PortfolioId,
    userId: UserId,
    payload: unknown
  ): WebAction<EnrichedTx> => {
    const txEnricher = getTxEnricher(yahooApi);
    const getAsset = assetGetterHelper(repo, assetId, portfolioId, userId);
    const enrichTx = txEnricher(getAsset);
    return pipe(
      txDecoder(payload),
      TE.chain((tx) => repo.tx.update(txId, tx, assetId, userId)),
      TE.chain(enrichTx),
      mapWebError
    );
  };

export const deleteTx =
  (repo: Repository) =>
  (txId: TxId, userId: UserId): WebAction<Optional<Id>> => {
    return pipe(
      repo.tx.delete(txId, userId),
      TE.map(([id, rows]) => (rows > 0 ? { id } : null)),
      mapWebError
    );
  };

export const deleteAllAssetTxs =
  (repo: Repository) =>
  (assetId: AssetId, userId: UserId): WebAction<Optional<Id>> => {
    return pipe(
      repo.tx.deleteAllAsset(assetId, userId),
      TE.map(([, rows]) => (rows > 0 ? { id: rows } : null)),
      mapWebError
    );
  };

export const uploadAssetTxs =
  (repo: Repository) =>
  (
    assetId: AssetId,
    userId: UserId,
    payload: unknown
  ): WebAction<Optional<Id>> => {
    return pipe(
      txUploadDecoder(payload),
      TE.chain((txs) => repo.tx.uploadTxs(assetId, txs, userId)),
      TE.map(([, rows]) => (rows > 0 ? { id: rows } : null)),
      mapWebError
    );
  };
