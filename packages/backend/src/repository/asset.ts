import {
  type Action,
  type GetAsset,
  type Optional,
  type PostAsset,
} from "@darkruby/assets-core";
import {
  GetAssetDecoder,
  GetAssetsDecoder,
} from "@darkruby/assets-core/src/decoders/asset";
import {
  liftTE,
  nullableDecoder,
} from "@darkruby/assets-core/src/decoders/util";
import type Database from "bun:sqlite";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { defaultPaging } from "../domain/paging";
import { execute, queryMany, queryOne, type ExecutionResult } from "./database";

export const getAssets =
  (db: Database) =>
  (
    portfolioId: number,
    userId: number,
    paging = defaultPaging()
  ): Action<GetAsset[]> =>
    pipe(
      db,
      queryMany<unknown[]>(
        `
      SELECT id,portfolio_id,name,ticker,created,modified,holdings,invested,avg_price,portfolio_contribution
			FROM assets_contributions A
			WHERE A.portfolio_id=$portfolioId AND A.user_id=$userId
			LIMIT $limit OFFSET $offset;
      `,
        { userId, portfolioId, ...paging }
      ),
      TE.chain(liftTE(GetAssetsDecoder))
    );

export const getAsset =
  (db: Database) =>
  (
    id: number,
    portfolioId: number,
    userId: number
  ): Action<Optional<GetAsset>> => {
    return pipe(
      db,
      queryOne(
        `
      SELECT id,portfolio_id,name,ticker,created,modified,holdings,invested,avg_price,portfolio_contribution
			FROM assets_contributions A
			WHERE A.id=$id AND A.portfolio_id=$portfolioId AND A.user_id=$userId
			LIMIT 1;`,
        { id, portfolioId, userId }
      ),
      TE.chain(liftTE(nullableDecoder(GetAssetDecoder)))
    );
  };

export const createAsset =
  (db: Database) =>
  (body: PostAsset, portfolioId: number): Action<ExecutionResult> =>
    pipe(
      db,
      execute<unknown[]>(
        `
        INSERT INTO assets (name, ticker, portfolio_id)
        VALUES ($name, $ticker, $portfolioId)
      `,
        { ...body, portfolioId }
      )
    );

export const updateAsset =
  (db: Database) =>
  (
    assetId: number,
    body: PostAsset,
    portfolioId: number
  ): Action<ExecutionResult> =>
    pipe(
      db,
      execute<unknown[]>(
        `
        UPDATE assets
        SET name = $name, ticker = $ticker, modified = CURRENT_TIMESTAMP
        WHERE id = $assetId and portfolio_id = $portfolioId
      `,
        { ...body, assetId, portfolioId }
      )
    );

export const deleteAsset =
  (db: Database) =>
  (id: number, portfolioId: number, userId: number): Action<ExecutionResult> =>
    pipe(
      db,
      execute<unknown>(
        `
      delete from assets
			where id in (
				select A.id
				from assets A
				inner join portfolios P ON P.id = A.portfolio_id
				where A.id=$id and P.id=$portfolioId AND P.user_id=$userId
				limit 1
			);
    `,
        { id, portfolioId, userId }
      )
    );
