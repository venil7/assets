import type {
  ActionResult,
  AssetId,
  EnrichedTx,
  Identity,
  Nullable,
  PortfolioId,
  PostTx,
  TxId,
} from "@darkruby/assets-core";
import { signal } from "@preact/signals-react";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { createTx, deleteTx, getTx, updateTx } from "../services/txs";
import { type StoreBase, createStoreBase } from "./base";

export type TxStore = Identity<
  StoreBase<Nullable<EnrichedTx>> & {
    load: (
      pid: PortfolioId,
      aid: AssetId,
      tid: TxId
    ) => ActionResult<Nullable<EnrichedTx>>;
    create: (
      pid: PortfolioId,
      aid: AssetId,
      t: PostTx
    ) => ActionResult<Nullable<EnrichedTx>>;
    update: (
      pid: PortfolioId,
      aid: AssetId,
      tid: TxId,
      t: PostTx
    ) => ActionResult<Nullable<EnrichedTx>>;
    delete: (
      pid: PortfolioId,
      aid: AssetId,
      tid: TxId
    ) => ActionResult<Nullable<EnrichedTx>>;
  }
>;

export const createTxStore = (): TxStore => {
  const data = signal<Nullable<EnrichedTx>>(null);
  const storeBase = createStoreBase(data);

  return {
    ...storeBase,
    load: (pid: PortfolioId, aid: AssetId, tid: TxId) =>
      storeBase.run(getTx(pid, aid, tid)),
    create: (pid: PortfolioId, aid: AssetId, t: PostTx) =>
      storeBase.run(createTx(pid, aid, t)),
    update: (pid: PortfolioId, aid: AssetId, tid: TxId, t: PostTx) =>
      storeBase.run(updateTx(pid, aid, tid, t)),
    delete: (pid: PortfolioId, aid: AssetId, tid: TxId) =>
      storeBase.run(
        pipe(
          deleteTx(pid, aid, tid),
          TE.map(() => null)
        )
      ),
  };
};
