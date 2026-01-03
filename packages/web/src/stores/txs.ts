import type {
  ActionResult,
  AssetId,
  GetTx,
  Identity,
  PostTx,
  PostTxsUpload,
  TxId,
} from "@darkruby/assets-core";
import { signal } from "@preact/signals-react";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import {
  createTx,
  deleteAllAssetTx,
  deleteTx,
  getTxs,
  updateTx,
  uploadTxs,
} from "../services/txs";
import { type StoreBase, createStoreBase } from "./base";

export type TxsStore = Identity<
  StoreBase<GetTx[]> & {
    load: (aid: AssetId) => ActionResult<GetTx[]>;
    create: (aid: AssetId, p: PostTx) => ActionResult<GetTx[]>;
    update: (aid: AssetId, tid: TxId, p: PostTx) => ActionResult<GetTx[]>;
    delete: (aid: AssetId, tid: TxId) => ActionResult<GetTx[]>;
    deleteAllAsset: (aid: AssetId) => ActionResult<GetTx[]>;
    upload: (aid: AssetId, data: PostTxsUpload) => ActionResult<GetTx[]>;
  }
>;

export const createTxsStore = (): TxsStore => {
  const data = signal<GetTx[]>([]);
  const storeBase = createStoreBase(data, () => []);

  return {
    ...storeBase,
    load: (aid: number) => storeBase.run(getTxs(aid)),
    create: (aid: number, p: PostTx) =>
      storeBase.run(
        pipe(
          createTx(aid, p),
          TE.chain(() => getTxs(aid))
        )
      ),
    update: (aid: number, tid: number, p: PostTx) =>
      storeBase.run(
        pipe(
          updateTx(aid, tid, p),
          TE.chain(() => getTxs(aid))
        )
      ),
    delete: (aid: number, tid: number) =>
      storeBase.run(
        pipe(
          deleteTx(aid, tid),
          TE.chain(() => getTxs(aid))
        )
      ),
    deleteAllAsset: (aid: AssetId) =>
      storeBase.run(
        pipe(
          deleteAllAssetTx(aid),
          TE.chain(() => getTxs(aid))
        )
      ),
    upload: (aid: AssetId, data: PostTxsUpload) =>
      storeBase.run(uploadTxs(aid, data)),
  };
};
