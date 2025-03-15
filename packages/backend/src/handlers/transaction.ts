import type { GetTransaction, Optional } from "@darkruby/assets-core";
import { PostTxDecoder } from "@darkruby/assets-core/src/decoders/transaction";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import type { Id } from "@darkruby/assets-core/src/domain/id";
import { type HandlerTask } from "@darkruby/fp-express";
import { Database } from "bun:sqlite";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { numberFromUrl } from "../decoders/params";
import { toWebError } from "../domain/error";
import * as txs from "../repository/transaction";

export type DatabaseCtx = {
  db: Database;
};

export const getTxs: HandlerTask<GetTransaction[], DatabaseCtx> = ({
  params: [req],
  context: { db },
}) =>
  pipe(
    TE.Do,
    TE.bind("assetId", () => numberFromUrl(req.params.asset_id)),
    TE.bind("txs", ({ assetId }) => txs.getTxs(db)(assetId, 1)),
    TE.map(({ txs }) => txs),
    TE.mapLeft(toWebError)
  );

export const getTx: HandlerTask<Optional<GetTransaction>, DatabaseCtx> = ({
  params: [req],
  context: { db },
}) =>
  pipe(
    TE.Do,
    TE.bind("id", () => numberFromUrl(req.params.id)),
    TE.bind("assetId", () => numberFromUrl(req.params.asset_id)),
    TE.bind("tx", ({ id, assetId }) => txs.getTx(db)(id, assetId, 1)),
    TE.map(({ tx }) => tx),
    TE.mapLeft(toWebError)
  );

export const createTx: HandlerTask<Optional<GetTransaction>, DatabaseCtx> = ({
  params: [req],
  context: { db },
}) =>
  pipe(
    TE.Do,
    TE.bind("body", () => pipe(req.body, liftTE(PostTxDecoder))),
    TE.bind("assetId", () => numberFromUrl(req.params.asset_id)),
    TE.bind("execution", ({ body, assetId }) =>
      txs.createTx(db)(body, assetId, 1)
    ),
    TE.chain(({ execution: [id], assetId }) => txs.getTx(db)(id, assetId, 1)),
    TE.mapLeft(toWebError)
  );

export const deleteTx: HandlerTask<Optional<Id>, DatabaseCtx> = ({
  params: [req],
  context: { db },
}) =>
  pipe(
    TE.Do,
    TE.bind("id", () => numberFromUrl(req.params.id)),
    TE.bind("delete", ({ id }) => txs.deleteTx(db)(id, 1)),
    TE.map(({ id, delete: [_, rowsDeleted] }) => (rowsDeleted ? { id } : null)),
    TE.mapLeft(toWebError)
  );
