import {
  type Action,
  type AssetId,
  type GetTx,
  type Id,
  type PostTx,
  type PostTxsUpload,
  type TxId,
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { apiFromToken } from "./api";

export const getTx = (aid: AssetId, tid: TxId): Action<GetTx> => {
  return pipe(
    apiFromToken,
    TE.chain(({ tx: p }) => p.get(aid, tid))
  );
};

export const getTxs = (aid: AssetId): Action<GetTx[]> => {
  return pipe(
    apiFromToken,
    TE.chain(({ tx: p }) => p.getMany(aid))
  );
};

export const createTx = (aid: AssetId, t: PostTx): Action<GetTx> => {
  return pipe(
    apiFromToken,
    TE.chain(({ tx }) => tx.create(aid, t))
  );
};

export const updateTx = (aid: AssetId, tid: TxId, t: PostTx): Action<GetTx> => {
  return pipe(
    apiFromToken,
    TE.chain(({ tx }) => tx.update(tid, aid, t))
  );
};

export const deleteTx = (aid: AssetId, txId: TxId): Action<Id> => {
  return pipe(
    apiFromToken,
    TE.chain(({ tx }) => tx.delete(aid, txId))
  );
};

export const deleteAllAssetTx = (aid: AssetId): Action<Id> => {
  return pipe(
    apiFromToken,
    TE.chain(({ tx }) => tx.deleteAllAsset(aid))
  );
};

export const uploadTxs = (
  aid: AssetId,
  payload: PostTxsUpload
): Action<GetTx[]> => {
  return pipe(
    apiFromToken,
    TE.chain(({ tx }) => tx.uploadAsset(aid, payload))
  );
};
