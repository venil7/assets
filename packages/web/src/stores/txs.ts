import type {
  ActionResult,
  AssetId,
  EnrichedTx,
  Identity,
  PortfolioId,
  PostTx,
  PostTxsUpload,
  TxId
} from "@darkruby/assets-core";
import { signal } from "@preact/signals-react";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { txs } from "../services/txs";
import { type StoreBase, createStoreBase } from "./base";

export type TxsStore = Identity<
  StoreBase<EnrichedTx[]> & {
    load: (pid: PortfolioId, aid: AssetId) => ActionResult<EnrichedTx[]>;
    create: (
      pid: PortfolioId,
      aid: AssetId,
      p: PostTx
    ) => ActionResult<EnrichedTx[]>;
    update: (
      pid: PortfolioId,
      aid: AssetId,
      tid: TxId,
      p: PostTx
    ) => ActionResult<EnrichedTx[]>;
    delete: (
      pid: PortfolioId,
      aid: AssetId,
      tid: TxId
    ) => ActionResult<EnrichedTx[]>;
    deleteAllAsset: (
      pid: PortfolioId,
      aid: AssetId
    ) => ActionResult<EnrichedTx[]>;
    upload: (
      pid: PortfolioId,
      aid: AssetId,
      data: PostTxsUpload
    ) => ActionResult<EnrichedTx[]>;
  }
>;

export const createTxsStore = (): TxsStore => {
  const data = signal<EnrichedTx[]>([]);
  const storeBase = createStoreBase(data, () => []);

  return {
    ...storeBase,
    load: (pid: PortfolioId, aid: AssetId) =>
      storeBase.run(txs.getMany(pid, aid)),
    create: (pid: PortfolioId, aid: AssetId, p: PostTx) =>
      storeBase.run(
        pipe(
          txs.create(pid, aid, p),
          TE.chain(() => txs.getMany(pid, aid))
        )
      ),
    update: (pid: PortfolioId, aid: AssetId, tid: number, p: PostTx) =>
      storeBase.run(
        pipe(
          txs.update(pid, aid, tid, p),
          TE.chain(() => txs.getMany(pid, aid))
        )
      ),
    delete: (pid: PortfolioId, aid: AssetId, tid: number) =>
      storeBase.run(
        pipe(
          txs.delete(pid, aid, tid),
          TE.chain(() => txs.getMany(pid, aid))
        )
      ),
    deleteAllAsset: (pid: PortfolioId, aid: AssetId) =>
      storeBase.run(
        pipe(
          txs.deleteAllAsset(pid, aid),
          TE.chain(() => txs.getMany(pid, aid))
        )
      ),
    upload: (pid: PortfolioId, aid: AssetId, data: PostTxsUpload) =>
      storeBase.run(txs.upload(pid, aid, data))
  };
};
