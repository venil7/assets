import type { GetTransaction, Optional } from "@darkruby/assets-core";
import { PostTxDecoder } from "@darkruby/assets-core/src/decoders/transaction";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import type { Id } from "@darkruby/assets-core/src/domain/id";
import { type HandlerTask } from "@darkruby/fp-express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { numberFromUrl } from "../decoders/params";
import { toWebError } from "../domain/error";
import type { Context } from "./context";

export const getTxs: HandlerTask<GetTransaction[], Context> = ({
  params: [req],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("assetId", () => numberFromUrl(req.params.asset_id)),
    TE.bind("txs", ({ assetId }) => repo.tx.getAll(assetId, 1)),
    TE.map(({ txs }) => txs),
    TE.mapLeft(toWebError)
  );

export const getTx: HandlerTask<Optional<GetTransaction>, Context> = ({
  params: [req],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("id", () => numberFromUrl(req.params.id)),
    TE.bind("assetId", () => numberFromUrl(req.params.asset_id)),
    TE.bind("tx", ({ id, assetId }) => repo.tx.get(id, assetId, 1)),
    TE.map(({ tx }) => tx),
    TE.mapLeft(toWebError)
  );

export const createTx: HandlerTask<Optional<GetTransaction>, Context> = ({
  params: [req],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("body", () => pipe(req.body, liftTE(PostTxDecoder))),
    TE.bind("assetId", () => numberFromUrl(req.params.asset_id)),
    TE.bind("execution", ({ body, assetId }) =>
      repo.tx.create(body, assetId, 1)
    ),
    TE.chain(({ execution: [id], assetId }) => repo.tx.get(id, assetId, 1)),
    TE.mapLeft(toWebError)
  );

export const deleteTx: HandlerTask<Optional<Id>, Context> = ({
  params: [req],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("id", () => numberFromUrl(req.params.id)),
    TE.bind("delete", ({ id }) => repo.tx.delete(id, 1)),
    TE.map(({ id, delete: [_, rowsDeleted] }) => (rowsDeleted ? { id } : null)),
    TE.mapLeft(toWebError)
  );

export const updateTx: HandlerTask<Optional<GetTransaction>, Context> = ({
  params: [req],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("id", () => numberFromUrl(req.params.id)),
    TE.bind("assetId", () => numberFromUrl(req.params.asset_id)),
    TE.bind("body", () => pipe(req.body, liftTE(PostTxDecoder))),
    TE.bind("update", ({ id, assetId, body }) =>
      repo.tx.update(id, body, assetId, 1)
    ),
    TE.chain(({ id, assetId }) => repo.tx.get(id, assetId, 1)),
    TE.mapLeft(toWebError)
  );
