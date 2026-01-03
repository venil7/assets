import {
  PostTxDecoder,
  PostTxsUploadDecoder,
  type AssetId,
  type GetTx,
  type Id,
  type Optional,
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

export const getTx =
  (repo: Repository) =>
  (
    txId: TxId,
    assetId: AssetId,
    userId: UserId
  ): WebAction<Optional<GetTx>> => {
    return pipe(repo.tx.get(txId, assetId, userId), mapWebError);
  };

export const getTxs =
  (repo: Repository) =>
  (assetId: AssetId, userId: UserId): WebAction<readonly GetTx[]> => {
    return pipe(repo.tx.getAll(assetId, userId), mapWebError);
  };

export const createTx =
  (repo: Repository) =>
  (assetId: AssetId, userId: UserId, payload: unknown): WebAction<GetTx> => {
    return pipe(
      txDecoder(payload),
      TE.chain((tx) => repo.tx.create(tx, assetId, userId)),
      mapWebError
    );
  };

export const updateTx =
  (repo: Repository) =>
  (
    txId: TxId,
    assetId: AssetId,
    userId: UserId,
    payload: unknown
  ): WebAction<GetTx> => {
    return pipe(
      txDecoder(payload),
      TE.chain((tx) => repo.tx.update(txId, tx, assetId, userId)),
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
