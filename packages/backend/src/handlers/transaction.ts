import type { GetTx, Optional } from "@darkruby/assets-core";
import type { Id } from "@darkruby/assets-core/src/domain/id";
import { type HandlerTask } from "@darkruby/fp-express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { numberFromUrl } from "../decoders/params";
import { mapWebError } from "../domain/error";
import type { Context } from "./context";

export const getTxs: HandlerTask<readonly GetTx[], Context> = ({
  params: [req, res],
  context: { service },
}) =>
  pipe(
    TE.Do,
    TE.bind("userId", () => service.auth.requireUserId(res)),
    TE.bind("assetId", () => numberFromUrl(req.params.asset_id)),
    mapWebError,
    TE.chain(({ assetId, userId }) => service.tx.getMany(assetId, userId))
  );

export const getTx: HandlerTask<Optional<GetTx>, Context> = ({
  params: [req, res],
  context: { service },
}) =>
  pipe(
    TE.Do,
    TE.bind("txId", () => numberFromUrl(req.params.id)),
    TE.bind("userId", () => service.auth.requireUserId(res)),
    TE.bind("assetId", () => numberFromUrl(req.params.asset_id)),
    mapWebError,
    TE.chain(({ txId, assetId, userId }) =>
      service.tx.get(txId, assetId, userId)
    )
  );

export const createTx: HandlerTask<Optional<GetTx>, Context> = ({
  params: [req, res],
  context: { service },
}) =>
  pipe(
    TE.Do,
    TE.bind("userId", () => service.auth.requireUserId(res)),
    TE.bind("assetId", () => numberFromUrl(req.params.asset_id)),
    mapWebError,
    TE.chain(({ assetId, userId }) =>
      service.tx.create(assetId, userId, req.body)
    )
  );

export const deleteTx: HandlerTask<Optional<Id>, Context> = ({
  params: [req, res],
  context: { service },
}) =>
  pipe(
    TE.Do,
    TE.bind("txId", () => numberFromUrl(req.params.id)),
    TE.bind("userId", () => service.auth.requireUserId(res)),
    mapWebError,
    TE.chain(({ txId, userId }) => service.tx.delete(txId, userId))
  );

export const updateTx: HandlerTask<Optional<GetTx>, Context> = ({
  params: [req, res],
  context: { service },
}) =>
  pipe(
    TE.Do,
    TE.bind("txId", () => numberFromUrl(req.params.id)),
    TE.bind("assetId", () => numberFromUrl(req.params.asset_id)),
    TE.bind("userId", () => service.auth.requireUserId(res)),
    mapWebError,
    TE.chain(({ txId, assetId, userId }) =>
      service.tx.update(txId, assetId, userId, req.body)
    )
  );

export const deleteAllAsset: HandlerTask<Optional<Id>, Context> = ({
  params: [req, res],
  context: { service },
}) =>
  pipe(
    TE.Do,
    TE.bind("assetId", () => numberFromUrl(req.params.asset_id)),
    TE.bind("userId", () => service.auth.requireUserId(res)),
    mapWebError,
    TE.chain(({ assetId, userId }) =>
      service.tx.deleteAllAsset(assetId, userId)
    )
  );

export const uploadAssetTxs: HandlerTask<Optional<Id>, Context> = ({
  params: [req, res],
  context: { service },
}) =>
  pipe(
    TE.Do,
    TE.bind("assetId", () => numberFromUrl(req.params.asset_id)),
    TE.bind("userId", () => service.auth.requireUserId(res)),
    mapWebError,
    TE.chain(({ assetId, userId }) =>
      service.tx.uploadAssetTxs(assetId, userId, req.body)
    )
  );
