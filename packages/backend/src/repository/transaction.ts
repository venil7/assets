import {
  validationError,
  type Action,
  type GetTransaction,
  type Optional,
  type PostTransaction,
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
    userId: number,
    assetId: number,
    paging = defaultPaging()
  ): Action<GetTransaction[]> =>
    pipe(
      db,
      queryMany<unknown[]>(
        `
      select id, asset_id, type, quantity, price, date, created, modified
		  from asset_transactions at
		  where at.asset_id=? and at.user_id=?
		  order by at.date desc
		  limit ? offset ?;
      `,
        [userId, assetId, ...paging]
      ),
      TE.chain(liftTE(GetTxsDecoder))
    );

export const getTx =
  (db: Database) =>
  (
    id: number,
    assetId: number,
    userId: number
  ): Action<Optional<GetTransaction>> => {
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
  (
    tx: PostTransaction,
    assetId: number,
    userId: number
  ): Action<ExecutionResult> =>
    pipe(
      db,
      execute<unknown[]>(
        `
        insert into transactions (asset_id, type, quantity, price, date)
			  values ($assetId, $type, $quantity, $price, $date)
      `,
        { assetId, ...PostTxDecoder.encode(tx) } as Record<string, any>
      ),
      TE.mapLeft((err) => {
        switch (true) {
          case err.message.includes("Insufficient holdings"):
            return validationError(
              {
                value: null,
                context: [],
                message: err.message,
              },
              err.message
            );
          default:
            return err;
        }
      })
    );

export const deleteTx =
  (db: Database) =>
  (id: number, userId: number): Action<ExecutionResult> =>
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
