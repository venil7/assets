import {
  validationError,
  type Action,
  type AppError,
  type GetTx,
  type Optional,
  type PostTx,
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
import * as TE from "fp-ts/lib/TaskEither";
import { defaultPaging } from "../domain/paging";
import { execute, queryMany, queryOne, type ExecutionResult } from "./database";

export const getTxs =
  (db: Database) =>
  (
    assetId: number,
    userId: UserId,
    paging = defaultPaging()
  ): Action<GetTx[]> =>
    pipe(
      db,
      queryMany<unknown[]>(
        `
      select id, asset_id, type, quantity, price, date, created, modified
		  from asset_transactions at
		  where at.asset_id=$assetId and at.user_id=$userId
		  order by at.date desc
		  limit $limit offset $offset;
      `,
        { userId, assetId, ...paging }
      ),
      TE.chain(liftTE(GetTxsDecoder))
    );

export const getTx =
  (db: Database) =>
  (id: number, assetId: number, userId: UserId): Action<Optional<GetTx>> => {
    return pipe(
      db,
      queryOne(
        `
      select id, asset_id, type, quantity, price, date, created, modified
		  from asset_transactions at
		  where at.id=$id and at.asset_id=$assetId and at.user_id=$userId
		  order by at.date desc
		  limit 1`,
        { id, assetId, userId }
      ),
      TE.chain(liftTE(nullableDecoder(GetTxDecoder)))
    );
  };

export const createTx =
  (db: Database) =>
  (tx: PostTx, assetId: number, userId: UserId): Action<ExecutionResult> =>
    pipe(
      db,
      execute<unknown[]>(
        `
        insert into transactions (asset_id, type, quantity, price, date)
			  values ($assetId, $type, $quantity, $price, $date)
      `,
        { assetId, ...PostTxDecoder.encode(tx) } as Record<string, any>
      ),
      TE.mapLeft(insufficientHoldingCheck)
    );

export const updateTx =
  (db: Database) =>
  (
    transactionId: number,
    tx: PostTx,
    assetId: number,
    userId: UserId
  ): Action<ExecutionResult> =>
    pipe(
      db,
      execute<unknown[]>(
        `
        UPDATE transactions
        SET type = $type, quantity = $quantity, price = $price, date = $date, modified = CURRENT_TIMESTAMP
        WHERE id = $transactionId and asset_id = $assetId
      `,
        { assetId, ...PostTxDecoder.encode(tx), transactionId } as Record<
          string,
          any
        >
      ),
      TE.mapLeft(insufficientHoldingCheck)
    );

export const deleteTx =
  (db: Database) =>
  (id: number, userId: UserId): Action<ExecutionResult> =>
    pipe(
      db,
      execute<unknown[]>(
        `
			delete from transactions
		  where id in (
				select at.id
				from asset_transactions at
				where at.id=$id and at.user_id=$userId
				limit 1
		  );
		`,
        { id, userId }
      )
    );

const insufficientHoldingCheck = (err: AppError) => {
  switch (true) {
    case err.message.includes("Insufficient holdings"):
      return validationError(err.message);
    default:
      return err;
  }
};
