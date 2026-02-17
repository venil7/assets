import type { EnrichedTx, GetTx, Optional } from "@darkruby/assets-core";
import type { Id } from "@darkruby/assets-core/src/domain/id";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { urlAssetId, urlPortfolioId, urlTxId } from "../decoders/params";
import { mapWebError } from "../domain/error";
import { type HandlerTask } from "../fp-express";
import type { Context } from "./context";

export const getTxs: HandlerTask<readonly EnrichedTx[], Context> = ({
  params: [req, res],
  context: { service }
}) =>
  pipe(
    TE.Do,
    TE.bind("userId", () => service.auth.requireUserId(res)),
    TE.bind("assetId", () => urlAssetId(req)),
    TE.bind("portfolioId", () => urlPortfolioId(req)),
    mapWebError,
    TE.chain(({ assetId, portfolioId, userId }) =>
      service.tx.getMany(assetId, portfolioId, userId)
    )
  );

export const getTx: HandlerTask<Optional<EnrichedTx>, Context> = ({
  params: [req, res],
  context: { service }
}) =>
  pipe(
    TE.Do,
    TE.bind("txId", () => urlTxId(req)),
    TE.bind("userId", () => service.auth.requireUserId(res)),
    TE.bind("assetId", () => urlAssetId(req)),
    TE.bind("portfolioId", () => urlPortfolioId(req)),
    mapWebError,
    TE.chain(({ txId, assetId, portfolioId, userId }) =>
      service.tx.get(txId, assetId, portfolioId, userId)
    )
  );

export const createTx: HandlerTask<Optional<EnrichedTx>, Context> = ({
  params: [req, res],
  context: { service }
}) =>
  pipe(
    TE.Do,
    TE.bind("userId", () => service.auth.requireUserId(res)),
    TE.bind("assetId", () => urlAssetId(req)),
    TE.bind("portfolioId", () => urlPortfolioId(req)),
    mapWebError,
    TE.chain(({ assetId, portfolioId, userId }) =>
      service.tx.create(assetId, portfolioId, userId, req.body)
    )
  );

export const deleteTx: HandlerTask<Optional<Id>, Context> = ({
  params: [req, res],
  context: { service }
}) =>
  pipe(
    TE.Do,
    TE.bind("txId", () => urlTxId(req)),
    TE.bind("userId", () => service.auth.requireUserId(res)),
    mapWebError,
    TE.chain(({ txId, userId }) => service.tx.delete(txId, userId))
  );

export const updateTx: HandlerTask<Optional<EnrichedTx>, Context> = ({
  params: [req, res],
  context: { service }
}) =>
  pipe(
    TE.Do,
    TE.bind("txId", () => urlTxId(req)),
    TE.bind("assetId", () => urlAssetId(req)),
    TE.bind("portfolioId", () => urlPortfolioId(req)),
    TE.bind("userId", () => service.auth.requireUserId(res)),
    mapWebError,
    TE.chain(({ txId, assetId, portfolioId, userId }) =>
      service.tx.update(txId, assetId, portfolioId, userId, req.body)
    )
  );

export const deleteAllAsset: HandlerTask<Optional<Id>, Context> = ({
  params: [req, res],
  context: { service }
}) =>
  pipe(
    TE.Do,
    TE.bind("assetId", () => urlAssetId(req)),
    TE.bind("userId", () => service.auth.requireUserId(res)),
    mapWebError,
    TE.chain(({ assetId, userId }) =>
      service.tx.deleteAllAsset(assetId, userId)
    )
  );

export const uploadAssetTxs: HandlerTask<readonly GetTx[], Context> = ({
  params: [req, res],
  context: { service }
}) =>
  pipe(
    TE.Do,
    TE.bind("assetId", () => urlAssetId(req)),
    TE.bind("portfolioId", () => urlPortfolioId(req)),
    TE.bind("userId", () => service.auth.requireUserId(res)),
    mapWebError,
    TE.bind("upload", ({ assetId, userId }) =>
      service.tx.uploadAssetTxs(assetId, userId, req.body)
    ),
    TE.chain(({ assetId, portfolioId, userId }) =>
      service.tx.getMany(assetId, portfolioId, userId)
    )
  );
