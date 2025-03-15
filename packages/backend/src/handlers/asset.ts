import type { GetAsset, Optional } from "@darkruby/assets-core";
import { PostAssetDecoder } from "@darkruby/assets-core/src/decoders/asset";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import type { Id } from "@darkruby/assets-core/src/domain/id";
import { type HandlerTask } from "@darkruby/fp-express";
import { Database } from "bun:sqlite";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { numberFromUrl } from "../decoders/params";
import { toWebError } from "../domain/error";
import * as assets from "../repository/asset";

export type DatabaseCtx = {
  db: Database;
};

export const getAssets: HandlerTask<GetAsset[], DatabaseCtx> = ({
  params: [req],
  context: { db },
}) =>
  pipe(
    TE.Do,
    TE.bind("portfolioId", () => numberFromUrl(req.params.portfolio_id)),
    TE.bind("assets", ({ portfolioId }) =>
      assets.getAssets(db)(portfolioId, 1)
    ),
    TE.map(({ assets }) => assets),
    TE.mapLeft(toWebError)
  );

export const getAsset: HandlerTask<Optional<GetAsset>, DatabaseCtx> = ({
  params: [req],
  context: { db },
}) =>
  pipe(
    TE.Do,
    TE.bind("id", () => numberFromUrl(req.params.id)),
    TE.bind("portfolioId", () => numberFromUrl(req.params.portfolio_id)),
    TE.bind("asset", ({ id, portfolioId }) =>
      assets.getAsset(db)(id, portfolioId, 1)
    ),
    TE.map(({ asset }) => asset),
    TE.mapLeft(toWebError)
  );

export const createAsset: HandlerTask<Optional<GetAsset>, DatabaseCtx> = ({
  params: [req],
  context: { db },
}) =>
  pipe(
    TE.Do,
    TE.bind("body", () => pipe(req.body, liftTE(PostAssetDecoder))),
    TE.bind("portfolioId", () => numberFromUrl(req.params.portfolio_id)),
    TE.bind("execution", ({ body, portfolioId }) =>
      assets.createAsset(db)(body, portfolioId)
    ),
    TE.chain(({ execution: [id], portfolioId }) =>
      assets.getAsset(db)(id, portfolioId, 1)
    ),
    TE.mapLeft(toWebError)
  );

export const deleteAsset: HandlerTask<Optional<Id>, DatabaseCtx> = ({
  params: [req],
  context: { db },
}) =>
  pipe(
    TE.Do,
    TE.bind("id", () => numberFromUrl(req.params.id)),
    TE.bind("portfolioId", () => numberFromUrl(req.params.portfolio_id)),
    TE.bind("delete", ({ id, portfolioId }) =>
      assets.deleteAsset(db)(id, portfolioId, 1)
    ),
    TE.map(({ id, delete: [_, rowsDeleted] }) => (rowsDeleted ? { id } : null)),
    TE.mapLeft(toWebError)
  );
