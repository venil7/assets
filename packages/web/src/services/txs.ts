import {
  byDateDesc,
  type Action,
  type AssetId,
  type EnrichedTx,
  type Id,
  type PortfolioId,
  type PostTx,
  type PostTxsUpload,
  type TxId
} from "@darkruby/assets-core";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { apiFromToken } from "./api";

const get = (pid: PortfolioId, aid: AssetId, tid: TxId): Action<EnrichedTx> => {
  return pipe(
    apiFromToken,
    TE.chain(({ tx }) => tx.get(pid, aid, tid))
  );
};

const getMany = (pid: PortfolioId, aid: AssetId): Action<EnrichedTx[]> => {
  return pipe(
    apiFromToken,
    TE.chain(({ tx }) => tx.getMany(pid, aid)),
    TE.map(A.sort(byDateDesc))
  );
};

const create = (
  pid: PortfolioId,
  aid: AssetId,
  t: PostTx
): Action<EnrichedTx> => {
  return pipe(
    apiFromToken,
    TE.chain(({ tx }) => tx.create(pid, aid, t))
  );
};

const update = (
  pid: PortfolioId,
  aid: AssetId,
  tid: TxId,
  t: PostTx
): Action<EnrichedTx> => {
  return pipe(
    apiFromToken,
    TE.chain(({ tx }) => tx.update(pid, aid, tid, t))
  );
};

const delete1 = (pid: PortfolioId, aid: AssetId, txId: TxId): Action<Id> => {
  return pipe(
    apiFromToken,
    TE.chain(({ tx }) => tx.delete(pid, aid, txId))
  );
};

const deleteAllAsset = (pid: PortfolioId, aid: AssetId): Action<Id> => {
  return pipe(
    apiFromToken,
    TE.chain(({ tx }) => tx.deleteAllAsset(pid, aid))
  );
};

const upload = (
  pid: PortfolioId,
  aid: AssetId,
  payload: PostTxsUpload
): Action<EnrichedTx[]> => {
  return pipe(
    apiFromToken,
    TE.chain(({ tx }) => tx.uploadAsset(pid, aid, payload)),
    TE.map(A.sort(byDateDesc))
  );
};

export const txs = {
  get,
  getMany,
  create,
  update,
  delete: delete1,
  deleteAllAsset,
  upload
};
