import { type EnrichedAsset, type Optional } from "@darkruby/assets-core";
import type { Id } from "@darkruby/assets-core/src/domain/id";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import {
  numberFromUrl,
  rangeFromUrl,
  urlAssetId,
  urlPortfolioId
} from "../decoders/params";
import { mapWebError } from "../domain/error";
import { type HandlerTask } from "../fp-express";
import type { Context } from "./context";

export const getAssets: HandlerTask<readonly EnrichedAsset[], Context> = ({
  params: [req, res],
  context: { service }
}) =>
  pipe(
    TE.Do,
    TE.bind("userId", () => service.auth.requireUserId(res)),
    TE.bind("range", () => rangeFromUrl(req.query.range)),
    TE.bind("portfolioId", () => urlPortfolioId(req)),
    mapWebError,
    TE.chain(({ userId, range, portfolioId }) =>
      service.assets.getMany(userId, portfolioId, range)
    )
  );

export const getAsset: HandlerTask<Optional<EnrichedAsset>, Context> = ({
  params: [req, res],
  context: { service }
}) =>
  pipe(
    TE.Do,
    TE.bind("assetId", () => urlAssetId(req)),
    TE.bind("range", () => rangeFromUrl(req.query.range)),
    TE.bind("userId", () => service.auth.requireUserId(res)),
    TE.bind("portfolioId", () => urlPortfolioId(req)),
    mapWebError,
    TE.chain(({ assetId, portfolioId, userId, range }) =>
      service.assets.get(assetId, portfolioId, userId, range)
    )
  );

export const createAsset: HandlerTask<Optional<EnrichedAsset>, Context> = ({
  params: [req, res],
  context: { repo, yahooApi, service }
}) =>
  pipe(
    TE.Do,
    TE.bind("userId", () => service.auth.requireUserId(res)),
    TE.bind("portfolioId", () => urlPortfolioId(req)),
    mapWebError,
    TE.chain(({ portfolioId, userId }) =>
      service.assets.create(portfolioId, userId, req.body)
    )
  );

export const deleteAsset: HandlerTask<Optional<Id>, Context> = ({
  params: [req, res],
  context: { service }
}) =>
  pipe(
    TE.Do,
    TE.bind("assetId", () => urlAssetId(req)),
    TE.bind("portfolioId", () => urlPortfolioId(req)),
    TE.bind("userId", () => service.auth.requireUserId(res)),
    mapWebError,
    TE.chain(({ assetId, portfolioId, userId }) =>
      service.assets.delete(assetId, portfolioId, userId)
    )
  );

export const updateAsset: HandlerTask<EnrichedAsset, Context> = ({
  params: [req, res],
  context: { service }
}) =>
  pipe(
    TE.Do,
    TE.bind("assetId", () => urlAssetId(req)),
    TE.bind("portfolioId", () => urlPortfolioId(req)),
    TE.bind("userId", () => service.auth.requireUserId(res)),
    mapWebError,
    TE.chain(({ assetId, portfolioId, userId }) =>
      service.assets.update(assetId, portfolioId, userId, req.body)
    )
  );

export const moveToPortfolio: HandlerTask<Optional<Id>, Context> = ({
  params: [req, res],
  context: { service }
}) =>
  pipe(
    TE.Do,
    TE.bind("assetId", () => urlAssetId(req)),
    TE.bind("portfolioId", () => urlPortfolioId(req)),
    TE.bind("newPortfolioId", () => numberFromUrl(req.params.new_portfolio_id)),
    TE.bind("userId", () => service.auth.requireUserId(res)),
    mapWebError,
    TE.chain(({ assetId, portfolioId, userId, newPortfolioId }) =>
      service.assets.move(assetId, portfolioId, userId, newPortfolioId)
    )
  );
