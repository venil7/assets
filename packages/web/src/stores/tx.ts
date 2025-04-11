import type {
  ActionResult,
  GetTx,
  Identity,
  Nullable,
  PostTx,
} from "@darkruby/assets-core";
import { signal } from "@preact/signals-react";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { createTx, deleteTx, getTx, updateTx } from "../services/txs";
import { type StoreBase, createStoreBase } from "./base";

export type TxStore = Identity<
  StoreBase<Nullable<GetTx>> & {
    load: (aid: number, tid: number) => ActionResult<Nullable<GetTx>>;
    create: (aid: number, t: PostTx) => ActionResult<Nullable<GetTx>>;
    update: (
      aid: number,
      tid: number,
      t: PostTx
    ) => ActionResult<Nullable<GetTx>>;
    delete: (aid: number, tid: number) => ActionResult<Nullable<GetTx>>;
  }
>;

export const createTxStore = (): TxStore => {
  const data = signal<Nullable<GetTx>>(null);
  const storeBase = createStoreBase(data);

  return {
    ...storeBase,
    load: (aid: number, tid: number) => storeBase.run(getTx(aid, tid)),
    create: (aid: number, t: PostTx) => storeBase.run(createTx(aid, t)),
    update: (aid: number, tid: number, p: PostTx) =>
      storeBase.run(updateTx(aid, tid, p)),
    delete: (aid: number, tid: number) =>
      storeBase.run(
        pipe(
          deleteTx(aid, tid),
          TE.map(() => null)
        )
      ),
  };
};
