import type {
  Action,
  EnrichedAsset,
  GetPortfolio,
  Optional,
} from "@darkruby/assets-core";
import {
  enrichAsset,
  enrichedOptionalPortfolio,
  enrichedPortfolios,
  type EnrichedPortfolio,
} from "@darkruby/assets-core";
import { PostPortfolioDecoder } from "@darkruby/assets-core/src/decoders/portfolio";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import type { Id } from "@darkruby/assets-core/src/domain/id";
import { type HandlerTask } from "@darkruby/fp-express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { numberFromUrl } from "../decoders/params";
import { toWebError } from "../domain/error";
import type { Context } from "./context";

export const getPortfolios: HandlerTask<EnrichedPortfolio[], Context> = ({
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("portfolios", () => repo.portfolio.getAll(1)),
    TE.chain(({ portfolios }) => {
      const f = (p: GetPortfolio) => {
        return pipe(
          repo.asset.getAll(p.id, 1),
          TE.chain(TE.traverseArray(enrichAsset))
        ) as Action<EnrichedAsset[]>;
      };
      return enrichedPortfolios(portfolios, f);
    }),
    TE.mapLeft(toWebError)
  );

export const getPortfolio: HandlerTask<
  Optional<EnrichedPortfolio>,
  Context
> = ({ params: [req], context: { repo } }) =>
  pipe(
    TE.Do,
    TE.bind("id", () => numberFromUrl(req.params.id)),
    TE.bind("portfolio", ({ id }) => repo.portfolio.get(id, 1)),
    TE.bind("assets", ({ id }) => repo.asset.getAll(id, 1)),
    TE.chain(({ portfolio, assets }) => {
      const enrichAssets = () =>
        pipe(assets, TE.traverseArray(enrichAsset)) as Action<EnrichedAsset[]>;
      return enrichedOptionalPortfolio(portfolio, enrichAssets);
    }),
    TE.mapLeft(toWebError)
  );

export const createPortfolio: HandlerTask<
  Optional<EnrichedPortfolio>,
  Context
> = ({ params: [req], context: { repo } }) =>
  pipe(
    TE.Do,
    TE.bind("body", () => pipe(req.body, liftTE(PostPortfolioDecoder))),
    TE.bind("execution", ({ body }) => repo.portfolio.create(body, 1)),
    TE.bind("portfolio", ({ execution: [id] }) => repo.portfolio.get(id, 1)),
    TE.bind("assets", ({ execution: [id] }) => repo.asset.getAll(id, 1)),
    TE.chain(({ portfolio, assets }) => {
      const enrichAssets = () =>
        pipe(assets, TE.traverseArray(enrichAsset)) as Action<EnrichedAsset[]>;
      return enrichedOptionalPortfolio(portfolio, enrichAssets);
    }),
    TE.mapLeft(toWebError)
  );

export const deletePortfolio: HandlerTask<Optional<Id>, Context> = ({
  params: [req],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("id", () => numberFromUrl(req.params.id)),
    TE.bind("delete", ({ id }) => repo.portfolio.delete(id, 1)),
    TE.map(({ id, delete: [_, rowsDeleted] }) => (rowsDeleted ? { id } : null)),
    TE.mapLeft(toWebError)
  );

export const updatePortfolio: HandlerTask<
  Optional<EnrichedPortfolio>,
  Context
> = ({ params: [req], context: { repo } }) =>
  pipe(
    TE.Do,
    TE.bind("id", () => numberFromUrl(req.params.id)),
    TE.bind("body", () => pipe(req.body, liftTE(PostPortfolioDecoder))),
    TE.bind("execution", ({ id, body }) => repo.portfolio.update(id, body, 1)),
    TE.bind("portfolio", ({ id }) => repo.portfolio.get(id, 1)),
    TE.bind("assets", ({ execution: [id] }) => repo.asset.getAll(id, 1)),
    TE.chain(({ portfolio, assets }) => {
      const enrichAssets = () =>
        pipe(assets, TE.traverseArray(enrichAsset)) as Action<EnrichedAsset[]>;
      return enrichedOptionalPortfolio(portfolio, enrichAssets);
    }),
    TE.mapLeft(toWebError)
  );
