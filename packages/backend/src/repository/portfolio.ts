import {
  handleError,
  type Action,
  type GetPortfolio,
  type Optional,
  type PortfolioId,
  type PostPortfolio,
  type UserId,
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
import * as ID from "fp-ts/lib/Identity";
import * as TE from "fp-ts/lib/TaskEither";

import { defaultPaging } from "../domain/paging";
import { execute, queryMany, queryOne, type ExecutionResult } from "./database";

import {
  deletePortfolioSql,
  getPortfolioSql,
  getPortfoliosSql,
  insertPortfolioSql,
  updatePortfolioSql,
} from "./sql" with { type: "macro" };

const sql = {
  portfolio: {
    get: TE.of(getPortfolioSql()),
    getMany: TE.of(getPortfoliosSql()),
    insert: TE.of(insertPortfolioSql()),
    update: TE.of(updatePortfolioSql()),
    delete: TE.of(deletePortfolioSql()),
  },
};

export const getPortfolios =
  (db: Database) =>
  (userId: UserId, paging = defaultPaging()): Action<GetPortfolio[]> =>
    pipe(
      queryMany<unknown[]>({ userId, ...paging }),
      ID.ap(sql.portfolio.getMany),
      ID.ap(db),
      TE.chain(liftTE(GetPortfoliosDecoder))
    );

export const getPortfolio =
  (db: Database) =>
  (
    portfolioId: PortfolioId,
    userId: UserId
  ): Action<Optional<GetPortfolio>> => {
    return pipe(
      queryOne({ portfolioId, userId }),
      ID.ap(sql.portfolio.get),
      ID.ap(db),
      TE.chain(liftTE(nullableDecoder(GetPortfolioDecoder)))
    );
  };

export const updatePortfolio =
  (db: Database) =>
  (
    portfolioId: PortfolioId,
    body: PostPortfolio,
    userId: UserId
  ): Action<GetPortfolio> =>
    pipe(
      execute<unknown[]>({ ...body, portfolioId, userId }),
      ID.ap(sql.portfolio.update),
      ID.ap(db),
      TE.chain(() => getPortfolio(db)(portfolioId, userId)),
      TE.filterOrElse(
        (p): p is GetPortfolio => Boolean(p),
        handleError("Failed to update portfolio")
      )
    );

export const createPortfolio =
  (db: Database) =>
  (body: PostPortfolio, userId: UserId): Action<GetPortfolio> =>
    pipe(
      execute<unknown[]>({ ...body, userId }),
      ID.ap(sql.portfolio.insert),
      ID.ap(db),
      TE.chain(([portfolioId]) => getPortfolio(db)(portfolioId, userId)),
      TE.filterOrElse(
        (p): p is GetPortfolio => Boolean(p),
        handleError("Failed to create portfolio")
      )
    );

export const deletePortfolio =
  (db: Database) =>
  (portfolioId: PortfolioId, userId: UserId): Action<ExecutionResult> =>
    pipe(
      execute<unknown[]>({ portfolioId, userId }),
      ID.ap(sql.portfolio.delete),
      ID.ap(db)
    );
