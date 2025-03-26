import {
  type Action,
  type GetPortfolio,
  type Optional,
  type PostPortfolio,
} from "@darkruby/assets-core";
import {
  GetPortfolioDecoder,
  GetPortfoliosDecoder,
} from "@darkruby/assets-core/src/decoders/portfolio";
import {
  liftTE,
  nullableDecoder,
} from "@darkruby/assets-core/src/decoders/util";
import type Database from "bun:sqlite";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { defaultPaging } from "../domain/paging";
import { execute, queryMany, queryOne, type ExecutionResult } from "./database";

export const getPortfolios =
  (db: Database) =>
  (userId: number, paging = defaultPaging()): Action<GetPortfolio[]> =>
    pipe(
      db,
      queryMany<unknown[]>(
        `
      select p.*
			from portfolios_ext p
			where p.user_id=$userId
			limit $limit offset $offset;
      `,
        { userId, ...paging }
      ),
      TE.chain(liftTE(GetPortfoliosDecoder))
    );

export const getPortfolio =
  (db: Database) =>
  (id: number, userId: number): Action<Optional<GetPortfolio>> => {
    return pipe(
      db,
      queryOne(
        `
      select p.*
			from portfolios_ext p
			where p.id=$id and p.user_id=$userId
      limit 1;`,
        { id, userId }
      ),
      TE.chain(liftTE(nullableDecoder(GetPortfolioDecoder)))
    );
  };

export const updatePortfolio =
  (db: Database) =>
  (
    portfolioId: number,
    body: PostPortfolio,
    userId: number
  ): Action<ExecutionResult> =>
    pipe(
      db,
      execute<unknown[]>(
        `
      UPDATE portfolios
      SET name = $name, description = $description, modified = CURRENT_TIMESTAMP
      WHERE id = $portfolioId AND user_id = $userId
      `,
        { ...body, portfolioId, userId }
      )
    );

export const createPortfolio =
  (db: Database) =>
  (body: PostPortfolio, userId: number): Action<ExecutionResult> =>
    pipe(
      db,
      execute<unknown[]>(
        `
      insert into portfolios(name, description, user_id)
		  values($name, $description, $userId)
      `,
        { ...body, userId }
      )
    );

export const deletePortfolio =
  (db: Database) =>
  (id: number, userId: number): Action<ExecutionResult> =>
    pipe(
      db,
      execute<unknown[]>(
        `
			delete from portfolios
			where id=$id AND user_id=$userId;
		`,
        { id, userId }
      )
    );
