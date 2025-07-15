import type {
  Action,
  EnrichedAsset,
  GetPortfolio,
  Optional,
} from "@darkruby/assets-core";
import {
  enrichOptionalPortfolio,
  enrichPortfolios,
  getAssetEnricher,
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
import { getProfile } from "./auth";
import type { Context } from "./context";

export const getPortfolios: HandlerTask<EnrichedPortfolio[], Context> = ({
  params: [_, res],
  context: { repo, yahooApi },
}) => {
  const enrichAsset = getAssetEnricher(yahooApi);
  return pipe(
    TE.Do,
    TE.bind("profile", () => getProfile(res)),
    TE.bind("portfolios", ({ profile }) => repo.portfolio.getAll(profile.id)),
    TE.chain(({ portfolios, profile }) => {
      const f = (p: GetPortfolio) => {
        return pipe(
          repo.asset.getAll(p.id, profile.id),
          TE.chain(TE.traverseArray(enrichAsset))
        ) as Action<EnrichedAsset[]>;
      };
      return enrichPortfolios(portfolios, f);
    }),
    TE.mapLeft(toWebError)
  );
};

export const getPortfolio: HandlerTask<
  Optional<EnrichedPortfolio>,
  Context
> = ({ params: [req, res], context: { repo, yahooApi } }) => {
  const enrichAsset = getAssetEnricher(yahooApi);
  return pipe(
    TE.Do,
    TE.bind("id", () => numberFromUrl(req.params.id)),
    TE.bind("range", () => rangeFromUrl(req.query.range)),
    TE.bind("profile", () => getProfile(res)),
    TE.bind("portfolio", ({ id, profile }) =>
      repo.portfolio.get(id, profile.id)
    ),
    TE.bind("assets", ({ id, profile }) => repo.asset.getAll(id, profile.id)),
    TE.chain(({ portfolio, assets, range }) => {
      const enrichAssets = () =>
        pipe(
          assets,
          TE.traverseArray((asset) => enrichAsset(asset, range!))
        ) as Action<EnrichedAsset[]>;
      return enrichOptionalPortfolio(portfolio, enrichAssets);
    }),
    TE.mapLeft(toWebError)
  );
};

export const createPortfolio: HandlerTask<
  Optional<EnrichedPortfolio>,
  Context
> = ({ params: [req, res], context: { repo, yahooApi } }) => {
  const enrichAsset = getAssetEnricher(yahooApi);

  return pipe(
    TE.Do,
    TE.bind("profile", () => getProfile(res)),
    TE.bind("body", () => pipe(req.body, liftTE(PostPortfolioDecoder))),
    TE.bind("execution", ({ body, profile }) =>
      repo.portfolio.create(body, profile.id)
    ),
    TE.bind("portfolio", ({ execution: [id], profile }) =>
      repo.portfolio.get(id, profile.id)
    ),
    TE.bind("assets", ({ execution: [id], profile }) =>
      repo.asset.getAll(id, profile.id)
    ),
    TE.chain(({ portfolio, assets }) => {
      const enrichAssets = () =>
        pipe(assets, TE.traverseArray(enrichAsset)) as Action<EnrichedAsset[]>;
      return enrichOptionalPortfolio(portfolio, enrichAssets);
    }),
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
    TE.bind("profile", () => getProfile(res)),
    TE.bind("delete", ({ id, profile }) =>
      repo.portfolio.delete(id, profile.id)
    ),
    TE.map(({ id, delete: [_, rowsDeleted] }) => (rowsDeleted ? { id } : null)),
    TE.mapLeft(toWebError)
  );

export const updatePortfolio: HandlerTask<
  Optional<EnrichedPortfolio>,
  Context
> = ({ params: [req, res], context: { repo, yahooApi } }) => {
  const enrichAsset = getAssetEnricher(yahooApi);

  return pipe(
    TE.Do,
    TE.bind("id", () => numberFromUrl(req.params.id)),
    TE.bind("body", () => pipe(req.body, liftTE(PostPortfolioDecoder))),
    TE.bind("profile", () => getProfile(res)),
    TE.bind("execution", ({ id, body, profile }) =>
      repo.portfolio.update(id, body, profile.id)
    ),
    TE.bind("portfolio", ({ id, profile }) =>
      repo.portfolio.get(id, profile.id)
    ),
    TE.bind("assets", ({ profile, execution: [id] }) =>
      repo.asset.getAll(id, profile.id)
    ),
    TE.chain(({ portfolio, assets }) => {
      const enrichAssets = () =>
        pipe(assets, TE.traverseArray(enrichAsset)) as Action<EnrichedAsset[]>;
      return enrichOptionalPortfolio(portfolio, enrichAssets);
    }),
    TE.mapLeft(toWebError)
  );
};
