import {
  getAssetsEnricher,
  getOptionalAssetsEnricher,
  type EnrichedAsset,
  type Optional,
} from "@darkruby/assets-core";
import { PostAssetDecoder } from "@darkruby/assets-core/src/decoders/asset";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import type { Id } from "@darkruby/assets-core/src/domain/id";
import { type HandlerTask } from "@darkruby/fp-express";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import { numberFromUrl, rangeFromUrl } from "../decoders/params";
import { toWebError } from "../domain/error";
import { checkTickerExists } from "../services/yahoo";
import { getProfile, getUserId } from "./auth";
import type { Context } from "./context";

export const getAssets: HandlerTask<EnrichedAsset[], Context> = ({
  params: [req, res],
  context: { repo, yahooApi },
}) =>
  pipe(
    TE.Do,
    TE.bind("userId", () => getUserId(res)),
    TE.bind("range", () => rangeFromUrl(req.query.range)),
    TE.bind("pref", ({ userId }) => repo.preference.get(userId)),
    TE.bind("portfolioId", () => numberFromUrl(req.params.portfolio_id)),
    TE.bind("assets", ({ userId, portfolioId }) =>
      repo.asset.getAll(portfolioId, userId)
    ),
    TE.let("enrichAssets", () => getAssetsEnricher(yahooApi)),
    TE.chain(({ assets, pref, range, enrichAssets }) =>
      enrichAssets(assets, pref.base_ccy, range!)
    ),
    TE.mapLeft(toWebError)
  );

export const getAsset: HandlerTask<Optional<EnrichedAsset>, Context> = ({
  params: [req, res],
  context: { repo, yahooApi },
}) =>
  pipe(
    TE.Do,
    TE.bind("id", () => numberFromUrl(req.params.id)),
    TE.bind("range", () => rangeFromUrl(req.query.range)),
    TE.bind("userId", () => getUserId(res)),
    TE.bind("pref", ({ userId }) => repo.preference.get(userId)),
    TE.bind("portfolioId", () => numberFromUrl(req.params.portfolio_id)),
    TE.bind("asset", ({ id, portfolioId, userId }) =>
      repo.asset.get(id, portfolioId, userId)
    ),
    TE.let("enrichAsset", () => getOptionalAssetsEnricher(yahooApi)),
    TE.chain(({ asset, enrichAsset, pref, range }) =>
      enrichAsset(asset, pref.base_ccy, range!)
    ),
    TE.mapLeft(toWebError)
  );

export const createAsset: HandlerTask<Optional<EnrichedAsset>, Context> = ({
  params: [req, res],
  context: { repo, yahooApi },
}) =>
  pipe(
    TE.Do,
    TE.bind("userId", () => getUserId(res)),
    TE.bind("portfolioId", () => numberFromUrl(req.params.portfolio_id)),
    TE.bind("pref", ({ userId }) => repo.preference.get(userId)),
    TE.bind("asset", () => pipe(req.body, liftTE(PostAssetDecoder))),
    TE.bind("yahooCheck", ({ asset }) =>
      pipe(asset.ticker, checkTickerExists(yahooApi))
    ),
    TE.let("enrichAsset", () => getOptionalAssetsEnricher(yahooApi)),
    TE.bind("createdAsset", ({ asset, portfolioId, userId }) => {
      return pipe(
        repo.asset.create(asset, portfolioId),
        TE.chain(([id]) => repo.asset.get(id, portfolioId, userId))
      );
    }),
    TE.chain(({ createdAsset, enrichAsset, pref }) =>
      enrichAsset(createdAsset, pref.base_ccy)
    ),
    TE.mapLeft(toWebError)
  );

export const deleteAsset: HandlerTask<Optional<Id>, Context> = ({
  params: [req, res],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("id", () => numberFromUrl(req.params.id)),
    TE.bind("portfolioId", () => numberFromUrl(req.params.portfolio_id)),
    TE.bind("profile", () => getProfile(res)),
    TE.bind("delete", ({ id, portfolioId, profile }) =>
      repo.asset.delete(id, portfolioId, profile.id)
    ),
    TE.map(({ id, delete: [_, rowsDeleted] }) => (rowsDeleted ? { id } : null)),
    TE.mapLeft(toWebError)
  );

export const updateAsset: HandlerTask<Optional<EnrichedAsset>, Context> = ({
  params: [req, res],
  context: { repo, yahooApi },
}) =>
  pipe(
    TE.Do,
    TE.bind("id", () => numberFromUrl(req.params.id)),
    TE.bind("userId", () => getUserId(res)),
    TE.bind("pref", ({ userId }) => repo.preference.get(userId)),
    TE.bind("portfolioId", () => numberFromUrl(req.params.portfolio_id)),
    TE.bind("asset", () => pipe(req.body, liftTE(PostAssetDecoder))),
    TE.bind("yahooCheck", ({ asset }) =>
      pipe(asset.ticker, checkTickerExists(yahooApi))
    ),
    TE.let("enrichAsset", () => getOptionalAssetsEnricher(yahooApi)),
    TE.bind("updatedAsset", ({ id, portfolioId, asset, userId }) => {
      return pipe(
        repo.asset.update(id, asset, portfolioId),
        TE.chain(() => repo.asset.get(id, portfolioId, userId))
      );
    }),
    TE.chain(({ enrichAsset, pref, updatedAsset }) =>
      enrichAsset(updatedAsset, pref.base_ccy)
    ),
    TE.mapLeft(toWebError)
  );
