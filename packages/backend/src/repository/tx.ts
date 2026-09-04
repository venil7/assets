import {
  handleError,
  TxTypes,
  validationError,
  type Action,
  type AppError,
  type AssetId,
  type GetTx,
  type Optional,
  type PostTx,
  type PostTxsUpload,
  type TxId,
  type TxType,
  type UserId
} from "@darkruby/assets-core";
import {
  GetTxDecoder,
  GetTxsDecoder,
  PostTxDecoder
} from "@darkruby/assets-core/src/decoders/tx";
import {
  liftTE,
  nullableDecoder
} from "@darkruby/assets-core/src/decoders/util";
import { type Changes, type Database } from "bun:sqlite";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as ID from "fp-ts/lib/Identity";
import * as SG from "fp-ts/lib/Semigroup";
import * as TE from "fp-ts/lib/TaskEither";
import { defaultPaging } from "../domain/paging";
import {
  defaultExecutionResult,
  execute,
  executionResult,
  ExecutionResultSemigroup,
  queryMany,
  queryOne,
  transaction,
  type ExecutionResult
} from "./database";
import {
  deleteAssetTxsSql,
  deleteTxSql,
  getTxSql,
  getTxsSql,
  insertTxSql,
  updateTxSql
} from "./sql" with { type: "macro" };

const sql = {
  tx: {
    get: TE.of(getTxSql()),
    getMany: TE.of(getTxsSql()),
    insert: TE.of(insertTxSql()),
    update: TE.of(updateTxSql()),
    delete: TE.of(deleteTxSql()),
    deleteAllAsset: TE.of(deleteAssetTxsSql())
  }
};

export const getTxs =
  (db: Database) =>
  (
    assetId: AssetId,
    userId: UserId,
    finalStretch: boolean,
    paging = defaultPaging()
  ): Action<GetTx[]> => {
    return pipe(
      queryMany<unknown[]>({
        userId,
        assetId,
        finalStretch: Number(finalStretch),
        ...paging
      }),
      ID.ap(sql.tx.getMany),
      ID.ap(db),
      TE.chain(liftTE(GetTxsDecoder))
    );
  };

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
        date: tx.date.toISOString()
      } as Record<string, any>),
      ID.ap(sql.tx.insert),
      ID.ap(db),
      TE.mapLeft(sqliteConstraintTrigger),
      TE.chain(([txId]) => getTx(db)(txId, assetId, userId)),
      TE.filterOrElse(
        (t): t is GetTx => Boolean(t),
        handleError("Failed to create transaction")
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
        date: tx.date.toISOString()
      } as Record<string, any>),
      ID.ap(sql.tx.update),
      ID.ap(db),
      TE.mapLeft(sqliteConstraintTrigger),
      TE.chain(() => getTx(db)(txId, assetId, userId)),
      TE.filterOrElse(
        (t): t is GetTx => Boolean(t),
        handleError("Failed to update transaction")
      )
    );

export const deleteTx =
  (db: Database) =>
  (txId: TxId, userId: UserId): Action<ExecutionResult> =>
    pipe(
      execute<unknown[]>({ txId, userId }),
      ID.ap(sql.tx.delete),
      ID.ap(db),
      TE.mapLeft(sqliteConstraintTrigger)
    );

export const deleteAssetTxs =
  (db: Database) =>
  (assetId: AssetId, userId: UserId): Action<ExecutionResult> =>
    pipe(
      [TxTypes.sell, TxTypes.buy] as TxType[],
      TE.traverseSeqArray((type) =>
        pipe(
          execute<unknown[]>({ assetId, userId, type }),
          ID.ap(sql.tx.deleteAllAsset),
          ID.ap(db)
        )
      ),
      TE.map(SG.concatAll(ExecutionResultSemigroup)(defaultExecutionResult()))
    );

export const uploadAssetTxs =
  (db: Database) =>
  (assetId: AssetId, { replace, txs }: PostTxsUpload, userId: UserId) => {
    const deleteTxs = db.prepare(deleteAssetTxsSql());
    const insertTx = db.prepare(insertTxSql());
    const func = () => {
      if (replace) {
        deleteTxs.run({ assetId, userId, type: TxTypes.sell });
        deleteTxs.run({ assetId, userId, type: TxTypes.buy });
      }
      return pipe(
        txs,
        A.map(({ date, ...tx }) =>
          insertTx.run({ assetId, date: date.toISOString(), ...tx })
        ),
        A.reduce<Changes, ExecutionResult>([0, 0], ([, rows], c) =>
          executionResult(Number(c.lastInsertRowid), rows + c.changes)
        )
      );
    };
    return pipe(
      transaction(func),
      ID.ap(db),
      TE.map((execResult) => execResult ?? defaultExecutionResult()),
      TE.mapLeft(sqliteConstraintTrigger)
    );
  };

const sqliteConstraintTrigger = (err: AppError) => {
  switch (true) {
    case err.message.includes("TX_INVARIANT_VIOLATION"):
      return validationError(`Transaction invariant violation`);
    case err.message.includes("SQLITE_CONSTRAINT_TRIGGER"):
    default:
      return err;
  }
};
