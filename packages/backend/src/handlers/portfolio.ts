import type { GetPortfolio, Optional } from "@darkruby/assets-core";
import { PostPortfolioDecoder } from "@darkruby/assets-core/src/decoders/portfolio";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import type { Id } from "@darkruby/assets-core/src/domain/id";
import { type HandlerTask } from "@darkruby/fp-express";
import { Database } from "bun:sqlite";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { numberFromUrl } from "../decoders/params";
import { toWebError } from "../domain/error";
import * as portfolio from "../repository/portfolio";

export type DatabaseCtx = {
  db: Database;
};

export const getPortfolios: HandlerTask<GetPortfolio[], DatabaseCtx> = ({
  context: { db },
}) => pipe(portfolio.getPortfolios(db)(1), TE.mapLeft(toWebError));

export const getPortfolio: HandlerTask<Optional<GetPortfolio>, DatabaseCtx> = ({
  params: [req],
  context: { db },
}) =>
  pipe(
    TE.Do,
    TE.bind("id", () => numberFromUrl(req.params.id)),
    TE.bind("portfolio", ({ id }) => portfolio.getPortfolio(db)(id, 1)),
    TE.map(({ portfolio }) => portfolio),
    TE.mapLeft(toWebError)
  );

export const createPortfolio: HandlerTask<
  Optional<GetPortfolio>,
  DatabaseCtx
> = ({ params: [req], context: { db } }) =>
  pipe(
    TE.Do,
    TE.bind("body", () => pipe(req.body, liftTE(PostPortfolioDecoder))),
    TE.bind("execution", ({ body }) => portfolio.createPortfolio(db)(body, 1)),
    TE.chain(({ execution: [id] }) => portfolio.getPortfolio(db)(id, 1)),
    TE.mapLeft(toWebError)
  );

export const deletePortfolio: HandlerTask<Optional<Id>, DatabaseCtx> = ({
  params: [req],
  context: { db },
}) =>
  pipe(
    TE.Do,
    TE.bind("id", () => numberFromUrl(req.params.id)),
    TE.bind("delete", ({ id }) => portfolio.deletePortfolio(db)(id, 1)),
    TE.map(({ id, delete: [_, rowsDeleted] }) => (rowsDeleted ? { id } : null)),
    TE.mapLeft(toWebError)
  );
