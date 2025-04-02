import type {
  ActionResult,
  EnrichedAsset,
  Identity,
  PostAsset,
} from "@darkruby/assets-core";
import { signal } from "@preact/signals-react";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import {
  createAsset,
  deleteAsset,
  getAssets,
  updateAsset,
} from "../services/assets";
import { type StoreBase, createStoreBase } from "./base";

export type AssetsStore = Identity<
  StoreBase<EnrichedAsset[]> & {
    load: (pid: number, force?: boolean) => ActionResult<EnrichedAsset[]>;
    create: (pid: number, a: PostAsset) => ActionResult<EnrichedAsset[]>;
    update: (
      pid: number,
      aid: number,
      a: PostAsset
    ) => ActionResult<EnrichedAsset[]>;
    delete: (pid: number, aid: number) => ActionResult<EnrichedAsset[]>;
  }
>;

export const createAssetsStore = (): AssetsStore => {
  const data = signal<EnrichedAsset[]>([]);
  const storeBase = createStoreBase(data);

  return {
    ...storeBase,
    load: (pid: number, force = true) => storeBase.run(getAssets(pid), force),
    create: (pid: number, a: PostAsset) =>
      storeBase.run(
        pipe(
          createAsset(pid, a),
          TE.chain(() => getAssets(pid))
        ),

        true
      ),
    update: (pid: number, aid: number, a: PostAsset) =>
      storeBase.run(
        pipe(
          updateAsset(pid, aid, a),
          TE.chain(() => getAssets(pid))
        ),
        true
      ),
    delete: (pid: number, aid: number) =>
      storeBase.run(
        pipe(
          deleteAsset(pid, aid),
          TE.chain(() => getAssets(pid))
        ),
        true
      ),
  };
};
