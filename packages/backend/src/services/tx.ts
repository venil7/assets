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
import type { TxEnricher } from "../enrichment";
import type { WebAction } from "../fp-express";
import type { Repository } from "../repository";

const txDecoder = liftTE(PostTxDecoder);
const txUploadDecoder = liftTE(PostTxsUploadDecoder);

export const getTx =
  (repo: Repository, { enrich }: TxEnricher) =>
  (
    txId: TxId,
    assetId: AssetId,
    _portfolioId: PortfolioId,
    userId: UserId
  ): WebAction<Optional<EnrichedTx>> => {
    return pipe(
      repo.tx.get(txId, assetId, userId),
      TE.chain((tx) => (tx ? enrich(tx) : TE.of(null))),
      mapWebError
    );
  };

export const getTxs =
  (repo: Repository, { enrichMany }: TxEnricher) =>
  (
    assetId: AssetId,
    _portfolioId: PortfolioId,
    userId: UserId,
    finalStretch: boolean = false
  ): WebAction<readonly EnrichedTx[]> => {
    return pipe(
      repo.tx.getAll(assetId, userId, finalStretch),
      TE.chain(enrichMany),
      mapWebError
    );
  };

export const createTx =
  (repo: Repository, { enrich }: TxEnricher) =>
  (
    assetId: AssetId,
    _portfolioId: PortfolioId,
    userId: UserId,
    payload: unknown
  ): WebAction<EnrichedTx> => {
    return pipe(
      txDecoder(payload),
      TE.chain((tx) => repo.tx.create(tx, assetId, userId)),
      TE.chain(enrich),
      mapWebError
    );
  };

export const updateTx =
  (repo: Repository, { enrich }: TxEnricher) =>
  (
    txId: TxId,
    assetId: AssetId,
    _portfolioId: PortfolioId,
    userId: UserId,
    payload: unknown
  ): WebAction<EnrichedTx> => {
    return pipe(
      txDecoder(payload),
      TE.chain((tx) => repo.tx.update(txId, tx, assetId, userId)),
      TE.chain(enrich),
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
