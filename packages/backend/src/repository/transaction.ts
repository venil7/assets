import {
  handleError,
  validationError,
  type Action,
  type AppError,
  type AssetId,
  type GetTx,
  type Optional,
  type PostTx,
  type TxId,
  type UserId,
} from "@darkruby/assets-core";
import {
  GetTxDecoder,
  GetTxsDecoder,
  PostTxDecoder,
} from "@darkruby/assets-core/src/decoders/transaction";
import {
  liftTE,
  nullableDecoder,
} from "@darkruby/assets-core/src/decoders/util";
import type Database from "bun:sqlite";
import { pipe } from "fp-ts/lib/function";
import * as ID from "fp-ts/lib/Identity";
import * as TE from "fp-ts/lib/TaskEither";

import { defaultPaging } from "../domain/paging";
import { execute, queryMany, queryOne, type ExecutionResult } from "./database";
import {
  deleteTxSql,
  getTxSql,
  getTxsSql,
  insertTxSql,
  updateTxSql,
} from "./sql" with { type: "macro" };

const sql = {
  tx: {
    get: TE.of(getTxSql()),
    getMany: TE.of(getTxsSql()),
    insert: TE.of(insertTxSql()),
    update: TE.of(updateTxSql()),
    delete: TE.of(deleteTxSql()),
  },
};

export const getTxs =
  (db: Database) =>
  (
    assetId: AssetId,
    userId: UserId,
    paging = defaultPaging()
  ): Action<GetTx[]> =>
    pipe(
      queryMany<unknown[]>({ userId, assetId, ...paging }),
      ID.ap(sql.tx.getMany),
      ID.ap(db),
      TE.chain(liftTE(GetTxsDecoder))
    );

export const getTx =
  (db: Database) =>
  (txId: TxId, assetId: AssetId, userId: UserId): Action<Optional<GetTx>> => {
    return pipe(
      queryOne({ txId, assetId, userId }),
      ID.ap(sql.tx.get),
      ID.ap(db),
      TE.chain(liftTE(nullableDecoder(GetTxDecoder)))
    );
  };

export const createTx =
  (db: Database) =>
  (tx: PostTx, assetId: AssetId, userId: UserId): Action<GetTx> =>
    pipe(
      execute<unknown[]>({
        assetId,
        ...PostTxDecoder.encode(tx),
        date: tx.date.toISOString(),
      } as Record<string, any>),
      ID.ap(sql.tx.insert),
      ID.ap(db),
      TE.mapLeft(insufficientHoldingCheck),
      TE.chain(([txId]) => getTx(db)(txId, assetId, userId)),
      TE.filterOrElse(
        (t): t is GetTx => Boolean(t),
        handleError("Failed to create portfolio")
      )
    );

export const updateTx =
  (db: Database) =>
  (txId: TxId, tx: PostTx, assetId: number, userId: UserId): Action<GetTx> =>
    pipe(
      execute<unknown[]>({
        assetId,
        ...PostTxDecoder.encode(tx),
        txId,
        date: tx.date.toISOString(),
      } as Record<string, any>),
      ID.ap(sql.tx.update),
      ID.ap(db),
      TE.mapLeft(insufficientHoldingCheck),
      TE.chain(() => getTx(db)(txId, assetId, userId)),
      TE.filterOrElse(
        (t): t is GetTx => Boolean(t),
        handleError("Failed to update transaction")
      )
    );

export const deleteTx =
  (db: Database) =>
  (txId: TxId, userId: UserId): Action<ExecutionResult> =>
    pipe(execute<unknown[]>({ txId, userId }), ID.ap(sql.tx.delete), ID.ap(db));

const insufficientHoldingCheck = (err: AppError) => {
  switch (true) {
    case err.message.includes("Insufficient holdings"):
      return validationError(err.message);
    default:
      return err;
  }
};
