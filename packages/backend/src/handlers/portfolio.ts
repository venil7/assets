import type { Optional } from "@darkruby/assets-core";
import { type EnrichedPortfolio } from "@darkruby/assets-core";
import type { Id } from "@darkruby/assets-core/src/domain/id";
import { type HandlerTask } from "@darkruby/fp-express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { rangeFromUrl, urlPortfolioId } from "../decoders/params";
import { mapWebError } from "../domain/error";
import type { Context } from "./context";

export const getPortfolios: HandlerTask<
  readonly EnrichedPortfolio[],
  Context
> = ({ params: [req, res], context: { repo, service } }) => {
  return pipe(
    TE.Do,
    TE.bind("userId", () => service.auth.requireUserId(res)),
    TE.bind("range", () => rangeFromUrl(req.query.range)),
    mapWebError,
    TE.chain(({ userId, range }) => service.portfolio.getMany(userId, range))
  );
};

export const getPortfolio: HandlerTask<
  Optional<EnrichedPortfolio>,
  Context
> = ({ params: [req, res], context: { repo, service } }) => {
  return pipe(
    TE.Do,
    TE.bind("userId", () => service.auth.requireUserId(res)),
    TE.bind("portfolioId", () => urlPortfolioId(req)),
    TE.bind("range", () => rangeFromUrl(req.query.range)),
    mapWebError,
    TE.chain(({ userId, portfolioId, range }) =>
      service.portfolio.get(portfolioId, userId, range)
    )
  );
};

export const createPortfolio: HandlerTask<
  Optional<EnrichedPortfolio>,
  Context
> = ({ params: [req, res], context: { repo, service } }) => {
  return pipe(
    service.auth.requireUserId(res),
    mapWebError,
    TE.chain((userId) => service.portfolio.create(userId, req.body))
  );
};

export const deletePortfolio: HandlerTask<Optional<Id>, Context> = ({
  params: [req, res],
  context: { repo, service },
}) =>
  pipe(
    TE.Do,
    TE.bind("portfolioId", () => urlPortfolioId(req)),
    TE.bind("userId", () => service.auth.requireUserId(res)),
    mapWebError,
    TE.chain(({ portfolioId, userId }) =>
      service.portfolio.delete(portfolioId, userId)
    )
  );

export const updatePortfolio: HandlerTask<
  Optional<EnrichedPortfolio>,
  Context
> = ({ params: [req, res], context: { repo, service } }) => {
  return pipe(
    TE.Do,
    TE.bind("userId", () => service.auth.requireUserId(res)),
    TE.bind("portfolioId", () => urlPortfolioId(req)),
    mapWebError,
    TE.chain(({ userId, portfolioId }) =>
      service.portfolio.update(portfolioId, userId, req.body)
    )
  );
};
