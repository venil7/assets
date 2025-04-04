import {
  type Action,
  type GetTx,
  type Id,
  type PostTx,
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { apiFromToken } from "./api";

export const getTx = (aid: number, tid: number): Action<GetTx> => {
  return pipe(
    apiFromToken,
    TE.chain(({ tx: p }) => p.get(aid, tid))
  );
};
export const getTxs = (aid: number): Action<GetTx[]> => {
  return pipe(
    apiFromToken,
    TE.chain(({ tx: p }) => p.getMany(aid))
  );
};

export const createTx = (aid: number, t: PostTx): Action<GetTx> => {
  return pipe(
    apiFromToken,
    TE.chain(({ tx }) => tx.create(aid, t))
  );
};

export const updateTx = (
  aid: number,
  tid: number,
  t: PostTx
): Action<GetTx> => {
  return pipe(
    apiFromToken,
    TE.chain(({ tx }) => tx.update(tid, aid, t))
  );
};

export const deleteTx = (aid: number, txId: number): Action<Id> => {
  return pipe(
    apiFromToken,
    TE.chain(({ tx }) => tx.delete(aid, txId))
  );
};
