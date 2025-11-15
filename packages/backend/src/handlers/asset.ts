import { type EnrichedAsset, type Optional } from "@darkruby/assets-core";
import type { Id } from "@darkruby/assets-core/src/domain/id";
import { type HandlerTask } from "@darkruby/fp-express";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import { numberFromUrl, rangeFromUrl } from "../decoders/params";
import { mapWebError } from "../domain/error";
import type { Context } from "./context";

export const getAssets: HandlerTask<readonly EnrichedAsset[], Context> = ({
  params: [req, res],
  context: { service },
}) =>
  pipe(
    TE.Do,
    TE.bind("userId", () => service.auth.requireUserId(res)),
    TE.bind("range", () => rangeFromUrl(req.query.range)),
    TE.bind("portfolioId", () => numberFromUrl(req.params.portfolio_id)),
    mapWebError,
    TE.chain(({ userId, range, portfolioId }) =>
      service.assets.getMany(userId, portfolioId, range)
    )
  );

export const getAsset: HandlerTask<Optional<EnrichedAsset>, Context> = ({
  params: [req, res],
  context: { service },
}) =>
  pipe(
    TE.Do,
    TE.bind("assetId", () => numberFromUrl(req.params.id)),
    TE.bind("range", () => rangeFromUrl(req.query.range)),
    TE.bind("userId", () => service.auth.requireUserId(res)),
    TE.bind("portfolioId", () => numberFromUrl(req.params.portfolio_id)),
    mapWebError,
    TE.chain(({ assetId, portfolioId, userId, range }) =>
      service.assets.get(assetId, portfolioId, userId, range)
    )
  );

export const createAsset: HandlerTask<Optional<EnrichedAsset>, Context> = ({
  params: [req, res],
  context: { repo, yahooApi, service },
}) =>
  pipe(
    TE.Do,
    TE.bind("userId", () => service.auth.requireUserId(res)),
    TE.bind("portfolioId", () => numberFromUrl(req.params.portfolio_id)),
    mapWebError,
    TE.chain(({ portfolioId, userId }) =>
      service.assets.create(portfolioId, userId, req.body)
    )
  );

export const deleteAsset: HandlerTask<Optional<Id>, Context> = ({
  params: [req, res],
  context: { service },
}) =>
  pipe(
    TE.Do,
    TE.bind("assetId", () => numberFromUrl(req.params.id)),
    TE.bind("portfolioId", () => numberFromUrl(req.params.portfolio_id)),
    TE.bind("userId", () => service.auth.requireUserId(res)),
    mapWebError,
    TE.chain(({ assetId, portfolioId, userId }) =>
      service.assets.delete(assetId, portfolioId, userId)
    )
  );

export const updateAsset: HandlerTask<EnrichedAsset, Context> = ({
  params: [req, res],
  context: { repo, yahooApi, service },
}) =>
  pipe(
    TE.Do,
    TE.bind("assetId", () => numberFromUrl(req.params.id)),
    TE.bind("portfolioId", () => numberFromUrl(req.params.portfolio_id)),
    TE.bind("userId", () => service.auth.requireUserId(res)),
    mapWebError,
    TE.chain(({ assetId, portfolioId, userId }) =>
      service.assets.update(assetId, portfolioId, userId, req.body)
    )
  );
