import {
  PostTxDecoder,
  PostTxsUploadDecoder,
  type AssetId,
  type EnrichedTx,
  type Id,
  type Optional,
  type PortfolioId,
  type TxId,
  type UserId
} from "@darkruby/assets-core";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import { mapWebError } from "../domain/error";
import { getTxEnricher, getTxsEnricher } from "../enrichment";
import type { WebAction } from "../fp-express";
import type { Repository } from "../repository";
import type { YahooApi } from "../yahoo/client";

const txDecoder = liftTE(PostTxDecoder);
const txUploadDecoder = liftTE(PostTxsUploadDecoder);

export const getTx =
  (repo: Repository, yahooApi: YahooApi) =>
  (
    txId: TxId,
    assetId: AssetId,
    _portfolioId: PortfolioId,
    userId: UserId
  ): WebAction<Optional<EnrichedTx>> => {
    const enrichTx = getTxEnricher(yahooApi);
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
    _portfolioId: PortfolioId,
    userId: UserId,
    finalStretch: boolean = false
  ): WebAction<readonly EnrichedTx[]> => {
    const enrichTxs = getTxsEnricher(yahooApi);

    return pipe(
      repo.tx.getAll(assetId, userId, finalStretch),
      TE.chain(enrichTxs),
      mapWebError
    );
  };

export const getFinalStretchTxs =
  (repo: Repository, yahooApi: YahooApi) =>
  (assetId: AssetId, _portfolioId: PortfolioId, userId: UserId) =>
    getTxs(repo, yahooApi)(
      assetId,
      _portfolioId,
      userId,
      true /*final stretch only */
    );

export const createTx =
  (repo: Repository, yahooApi: YahooApi) =>
  (
    assetId: AssetId,
    _portfolioId: PortfolioId,
    userId: UserId,
    payload: unknown
  ): WebAction<EnrichedTx> => {
    const enrichTx = getTxEnricher(yahooApi);
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
    _portfolioId: PortfolioId,
    userId: UserId,
    payload: unknown
  ): WebAction<EnrichedTx> => {
    const enrichTx = getTxEnricher(yahooApi);
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
