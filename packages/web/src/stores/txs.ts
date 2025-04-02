import type {
  ActionResult,
  GetTx,
  Identity,
  PostTx,
} from "@darkruby/assets-core";
import { signal } from "@preact/signals-react";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { createTx, deleteTx, getTxs, updateTx } from "../services/txs";
import { type StoreBase, createStoreBase } from "./base";

export type TxsStore = Identity<
  StoreBase<GetTx[]> & {
    load: (aid: number, force?: boolean) => ActionResult<GetTx[]>;
    create: (aid: number, p: PostTx) => ActionResult<GetTx[]>;
    update: (aid: number, tid: number, p: PostTx) => ActionResult<GetTx[]>;
    delete: (aid: number, tid: number) => ActionResult<GetTx[]>;
  }
>;

export const createTxsStore = (): TxsStore => {
  const data = signal<GetTx[]>([]);
  const storeBase = createStoreBase(data, (t) => !!t.length);

  return {
    ...storeBase,
    load: (aid: number, force = false) => storeBase.run(getTxs(aid), force),
    create: (aid: number, p: PostTx) =>
      storeBase.run(
        pipe(
          createTx(aid, p),
          TE.chain(() => getTxs(aid))
        ),
        true
      ),
    update: (aid: number, tid: number, p: PostTx) =>
      storeBase.run(
        pipe(
          updateTx(aid, tid, p),
          TE.chain(() => getTxs(aid))
        ),
        true
      ),
    delete: (aid: number, tid: number) =>
      storeBase.run(
        pipe(
          deleteTx(aid, tid),
          TE.chain(() => getTxs(aid))
        ),
        true
      ),
  };
};
