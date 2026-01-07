import {
  type Action,
  type AssetId,
  type EnrichedTx,
  type Id,
  type PortfolioId,
  type PostTx,
  type PostTxsUpload,
  type TxId,
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { apiFromToken } from "./api";

export const getTx = (
  pid: PortfolioId,
  aid: AssetId,
  tid: TxId
): Action<EnrichedTx> => {
  return pipe(
    apiFromToken,
    TE.chain(({ tx }) => tx.get(pid, aid, tid))
  );
};

export const getTxs = (
  pid: PortfolioId,
  aid: AssetId
): Action<EnrichedTx[]> => {
  return pipe(
    apiFromToken,
    TE.chain(({ tx }) => tx.getMany(pid, aid))
  );
};

export const createTx = (
  pid: PortfolioId,
  aid: AssetId,
  t: PostTx
): Action<EnrichedTx> => {
  return pipe(
    apiFromToken,
    TE.chain(({ tx }) => tx.create(pid, aid, t))
  );
};

export const updateTx = (
  pid: PortfolioId,
  aid: AssetId,
  tid: TxId,
  t: PostTx
): Action<EnrichedTx> => {
  return pipe(
    apiFromToken,
    TE.chain(({ tx }) => tx.update(pid, tid, aid, t))
  );
};

export const deleteTx = (
  pid: PortfolioId,
  aid: AssetId,
  txId: TxId
): Action<Id> => {
  return pipe(
    apiFromToken,
    TE.chain(({ tx }) => tx.delete(pid, aid, txId))
  );
};

export const deleteAllAssetTx = (
  pid: PortfolioId,
  aid: AssetId
): Action<Id> => {
  return pipe(
    apiFromToken,
    TE.chain(({ tx }) => tx.deleteAllAsset(pid, aid))
  );
};

export const uploadTxs = (
  pid: PortfolioId,
  aid: AssetId,
  payload: PostTxsUpload
): Action<EnrichedTx[]> => {
  return pipe(
    apiFromToken,
    TE.chain(({ tx }) => tx.uploadAsset(pid, aid, payload))
  );
};
