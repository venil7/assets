import {
  generalError,
  getTxEnricher,
  getTxsEnricher,
  PostTxDecoder,
  PostTxsUploadDecoder,
  type AssetId,
  type EnrichedAsset,
  type EnrichedTx,
  type Id,
  type Nullable,
  type Optional,
  type PortfolioId,
  type TxId,
  type UserId,
} from "@darkruby/assets-core";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import type { WebAction } from "@darkruby/fp-express";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import { mapWebError } from "../domain/error";
import type { Repository } from "../repository";

const txDecoder = liftTE(PostTxDecoder);
const txUploadDecoder = liftTE(PostTxsUploadDecoder);

const assetGetter =
  (
    repo: Repository,
    assetId: AssetId,
    portfolioId: PortfolioId,
    userId: UserId
  ) =>
  () =>
    pipe(
      repo.asset.get(assetId, portfolioId, userId),
      TE.filterOrElse(
        (x): x is EnrichedAsset => Boolean(x),
        () => generalError(`asset not found`)
      )
    );

export const getTx =
  (repo: Repository) =>
  (
    txId: TxId,
    assetId: AssetId,
    portfolioId: PortfolioId,
    userId: UserId
  ): WebAction<Optional<EnrichedTx>> => {
    const getAsset = assetGetter(repo, assetId, portfolioId, userId);
    const enrichTx = getTxEnricher(getAsset);
    return pipe(
      repo.tx.get(txId, assetId, userId),
      TE.chain((tx) => (tx ? enrichTx(tx) : TE.of(null))),
      mapWebError
    );
  };

export const getTxs =
  (repo: Repository) =>
  (
    assetId: AssetId,
    portfolioId: PortfolioId,
    userId: UserId,
    after: Nullable<Date> = null
  ): WebAction<readonly EnrichedTx[]> => {
    const getAsset = assetGetter(repo, assetId, portfolioId, userId);
    return pipe(
      repo.tx.getAll(assetId, userId, after),
      TE.chain(getTxsEnricher(getAsset)),
      mapWebError
    );
  };

export const createTx =
  (repo: Repository) =>
  (
    assetId: AssetId,
    portfolioId: PortfolioId,
    userId: UserId,
    payload: unknown
  ): WebAction<EnrichedTx> => {
    const getAsset = assetGetter(repo, assetId, portfolioId, userId);
    return pipe(
      txDecoder(payload),
      TE.chain((tx) => repo.tx.create(tx, assetId, userId)),
      TE.chain(getTxEnricher(getAsset)),
      mapWebError
    );
  };

export const updateTx =
  (repo: Repository) =>
  (
    txId: TxId,
    assetId: AssetId,
    portfolioId: PortfolioId,
    userId: UserId,
    payload: unknown
  ): WebAction<EnrichedTx> => {
    const getAsset = assetGetter(repo, assetId, portfolioId, userId);
    return pipe(
      txDecoder(payload),
      TE.chain((tx) => repo.tx.update(txId, tx, assetId, userId)),
      TE.chain(getTxEnricher(getAsset)),
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
