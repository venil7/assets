import {
  enrichedAssets,
  enrichOptionalAsset,
  type EnrichedAsset,
  type Optional,
} from "@darkruby/assets-core";
import { PostAssetDecoder } from "@darkruby/assets-core/src/decoders/asset";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import type { Id } from "@darkruby/assets-core/src/domain/id";
import { type HandlerTask } from "@darkruby/fp-express";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import { numberFromUrl } from "../decoders/params";
import { toWebError } from "../domain/error";
import { getProfile } from "./auth";
import type { Context } from "./context";

export const getAssets: HandlerTask<EnrichedAsset[], Context> = ({
  params: [req, res],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("profile", () => getProfile(res)),
    TE.bind("portfolioId", () => numberFromUrl(req.params.portfolio_id)),
    TE.bind("assets", ({ profile, portfolioId }) =>
      repo.asset.getAll(portfolioId, profile.id)
    ),
    TE.chain(({ assets }) => enrichedAssets(assets)),
    TE.mapLeft(toWebError)
  );

export const getAsset: HandlerTask<Optional<EnrichedAsset>, Context> = ({
  params: [req, res],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("id", () => numberFromUrl(req.params.id)),
    TE.bind("profile", () => getProfile(res)),
    TE.bind("portfolioId", () => numberFromUrl(req.params.portfolio_id)),
    TE.bind("asset", ({ id, portfolioId, profile }) =>
      repo.asset.get(id, portfolioId, profile.id)
    ),
    TE.map(({ asset }) => asset),
    TE.chain(enrichOptionalAsset),
    TE.mapLeft(toWebError)
  );

export const createAsset: HandlerTask<Optional<EnrichedAsset>, Context> = ({
  params: [req, res],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("body", () => pipe(req.body, liftTE(PostAssetDecoder))),
    TE.bind("profile", () => getProfile(res)),
    TE.bind("portfolioId", () => numberFromUrl(req.params.portfolio_id)),
    TE.bind("execution", ({ body, portfolioId }) =>
      repo.asset.create(body, portfolioId)
    ),
    TE.chain(({ execution: [id], portfolioId, profile }) =>
      repo.asset.get(id, portfolioId, profile.id)
    ),
    TE.chain(enrichOptionalAsset),
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
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("id", () => numberFromUrl(req.params.id)),
    TE.bind("portfolioId", () => numberFromUrl(req.params.portfolio_id)),
    TE.bind("profile", () => getProfile(res)),
    TE.bind("body", () => pipe(req.body, liftTE(PostAssetDecoder))),
    TE.bind("update", ({ id, portfolioId, body }) =>
      repo.asset.update(id, body, portfolioId)
    ),
    TE.chain(({ id, portfolioId, profile }) =>
      repo.asset.get(id, portfolioId, profile.id)
    ),
    TE.chain(enrichOptionalAsset),
    TE.mapLeft(toWebError)
  );
