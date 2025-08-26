import type { GetPortfolio, Optional } from "@darkruby/assets-core";
import {
  getOptionalPorfolioEnricher,
  getPortfoliosEnricher,
  type EnrichedPortfolio,
} from "@darkruby/assets-core";
import { PostPortfolioDecoder } from "@darkruby/assets-core/src/decoders/portfolio";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import type { Id } from "@darkruby/assets-core/src/domain/id";
import { type HandlerTask } from "@darkruby/fp-express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { numberFromUrl, rangeFromUrl } from "../decoders/params";
import { toWebError } from "../domain/error";
import { getUserId } from "./auth";
import type { Context } from "./context";

export const getPortfolios: HandlerTask<EnrichedPortfolio[], Context> = ({
  params: [req, res],
  context: { repo, yahooApi },
}) => {
  return pipe(
    TE.Do,
    TE.bind("userId", () => getUserId(res)),
    TE.bind("range", () => rangeFromUrl(req.query.range)),
    TE.bind("portfolios", ({ userId }) => repo.portfolio.getAll(userId)),
    TE.let("enrichPortfolios", ({ range }) =>
      getPortfoliosEnricher(yahooApi, range!)
    ),
    TE.chain(({ portfolios, enrichPortfolios, userId }) => {
      const getAssets = (p: GetPortfolio) => repo.asset.getAll(p.id, userId);
      return enrichPortfolios(portfolios, getAssets);
    }),
    TE.mapLeft(toWebError)
  );
};

export const getPortfolio: HandlerTask<
  Optional<EnrichedPortfolio>,
  Context
> = ({ params: [req, res], context: { repo, yahooApi } }) => {
  return pipe(
    TE.Do,
    TE.bind("id", () => numberFromUrl(req.params.id)),
    TE.bind("range", () => rangeFromUrl(req.query.range)),
    TE.bind("userId", () => getUserId(res)),
    TE.bind("portfolio", ({ id, userId }) => repo.portfolio.get(id, userId)),
    TE.let("enrichPortfolio", ({ range }) =>
      getOptionalPorfolioEnricher(yahooApi, range!)
    ),
    TE.chain(({ portfolio, enrichPortfolio, userId }) => {
      const getAssets = () => repo.asset.getAll(portfolio!.id, userId);
      return enrichPortfolio(portfolio, getAssets);
    }),
    TE.mapLeft(toWebError)
  );
};

export const createPortfolio: HandlerTask<
  Optional<EnrichedPortfolio>,
  Context
> = ({ params: [req, res], context: { repo, yahooApi } }) => {
  return pipe(
    TE.Do,
    TE.bind("userId", () => getUserId(res)),
    TE.bind("body", () => pipe(req.body, liftTE(PostPortfolioDecoder))),
    TE.bind("execution", ({ body, userId }) =>
      repo.portfolio.create(body, userId)
    ),
    TE.let("enrichPortfolio", () => getOptionalPorfolioEnricher(yahooApi)),
    TE.bind("portfolio", ({ execution: [id], userId }) =>
      repo.portfolio.get(id, userId)
    ),
    TE.chain(({ portfolio, enrichPortfolio }) =>
      enrichPortfolio(portfolio, () => TE.of([]))
    ),
    TE.mapLeft(toWebError)
  );
};

export const deletePortfolio: HandlerTask<Optional<Id>, Context> = ({
  params: [req, res],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("id", () => numberFromUrl(req.params.id)),
    TE.bind("userId", () => getUserId(res)),
    TE.bind("delete", ({ id, userId }) => repo.portfolio.delete(id, userId)),
    TE.map(({ id, delete: [_, rowsDeleted] }) => (rowsDeleted ? { id } : null)),
    TE.mapLeft(toWebError)
  );

export const updatePortfolio: HandlerTask<
  Optional<EnrichedPortfolio>,
  Context
> = ({ params: [req, res], context: { repo, yahooApi } }) => {
  return pipe(
    TE.Do,
    TE.bind("id", () => numberFromUrl(req.params.id)),
    TE.bind("body", () => pipe(req.body, liftTE(PostPortfolioDecoder))),
    TE.bind("userId", () => getUserId(res)),
    TE.bind("execution", ({ id, body, userId }) =>
      repo.portfolio.update(id, body, userId)
    ),
    TE.let("enrichPortfolio", () => getOptionalPorfolioEnricher(yahooApi)),
    TE.bind("portfolio", ({ id, userId }) => repo.portfolio.get(id, userId)),
    TE.chain(({ portfolio, enrichPortfolio, userId }) => {
      const getAssets = () => repo.asset.getAll(portfolio!.id, userId);
      return enrichPortfolio(portfolio, getAssets);
    }),
    TE.mapLeft(toWebError)
  );
};
