import type { GetTransaction, Optional } from "@darkruby/assets-core";
import { PostTxDecoder } from "@darkruby/assets-core/src/decoders/transaction";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import type { Id } from "@darkruby/assets-core/src/domain/id";
import { type HandlerTask } from "@darkruby/fp-express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { numberFromUrl } from "../decoders/params";
import { toWebError } from "../domain/error";
import { getProfile } from "./auth";
import type { Context } from "./context";

export const getTxs: HandlerTask<GetTransaction[], Context> = ({
  params: [req, res],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("assetId", () => numberFromUrl(req.params.asset_id)),
    TE.bind("profile", () => getProfile(res)),
    TE.bind("txs", ({ assetId, profile }) =>
      repo.tx.getAll(assetId, profile.id)
    ),
    TE.map(({ txs }) => txs),
    TE.mapLeft(toWebError)
  );

export const getTx: HandlerTask<Optional<GetTransaction>, Context> = ({
  params: [req, res],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("id", () => numberFromUrl(req.params.id)),
    TE.bind("profile", () => getProfile(res)),
    TE.bind("assetId", () => numberFromUrl(req.params.asset_id)),
    TE.chain(({ id, assetId, profile }) =>
      repo.tx.get(id, assetId, profile.id)
    ),
    TE.mapLeft(toWebError)
  );

export const createTx: HandlerTask<Optional<GetTransaction>, Context> = ({
  params: [req, res],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("body", () => pipe(req.body, liftTE(PostTxDecoder))),
    TE.bind("assetId", () => numberFromUrl(req.params.asset_id)),
    TE.bind("profile", () => getProfile(res)),
    TE.bind("execution", ({ body, assetId, profile }) =>
      repo.tx.create(body, assetId, profile.id)
    ),
    TE.chain(({ execution: [id], assetId, profile }) =>
      repo.tx.get(id, assetId, profile.id)
    ),
    TE.mapLeft(toWebError)
  );

export const deleteTx: HandlerTask<Optional<Id>, Context> = ({
  params: [req, res],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("id", () => numberFromUrl(req.params.id)),
    TE.bind("profile", () => getProfile(res)),
    TE.bind("delete", ({ id, profile }) => repo.tx.delete(id, profile.id)),
    TE.map(({ id, delete: [_, rowsDeleted] }) => (rowsDeleted ? { id } : null)),
    TE.mapLeft(toWebError)
  );

export const updateTx: HandlerTask<Optional<GetTransaction>, Context> = ({
  params: [req, res],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("id", () => numberFromUrl(req.params.id)),
    TE.bind("assetId", () => numberFromUrl(req.params.asset_id)),
    TE.bind("profile", () => getProfile(res)),
    TE.bind("body", () => pipe(req.body, liftTE(PostTxDecoder))),
    TE.bind("update", ({ id, assetId, body, profile }) =>
      repo.tx.update(id, body, assetId, profile.id)
    ),
    TE.chain(({ id, assetId, profile }) =>
      repo.tx.get(id, assetId, profile.id)
    ),
    TE.mapLeft(toWebError)
  );
