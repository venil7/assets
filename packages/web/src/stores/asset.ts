import type {
  ActionResult,
  EnrichedAsset,
  Identity,
  Nullable,
  PostAsset,
} from "@darkruby/assets-core";
import type { ChartRange } from "@darkruby/assets-core/src/decoders/yahoo/meta";
import { signal } from "@preact/signals-react";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import {
  createAsset,
  deleteAsset,
  getAsset,
  updateAsset,
} from "../services/assets";
import { type StoreBase, createStoreBase } from "./base";

export type AssetStore = Identity<
  StoreBase<Nullable<EnrichedAsset>> & {
    load: (
      portfolioId: number,
      assetId: number,
      range?: ChartRange
    ) => ActionResult<Nullable<EnrichedAsset>>;
    create: (
      portfolioId: number,
      asset: PostAsset
    ) => ActionResult<Nullable<EnrichedAsset>>;
    update: (
      portfolioId: number,
      assetId: number,
      asset: PostAsset
    ) => ActionResult<Nullable<EnrichedAsset>>;
    delete: (
      portfolioId: number,
      assetId: number
    ) => ActionResult<Nullable<EnrichedAsset>>;
  }
>;

export const createAssetStore = (): AssetStore => {
  const data = signal<Nullable<EnrichedAsset>>(null);
  const storeBase = createStoreBase(data);

  return {
    ...storeBase,
    load: (pid: number, aid: number, range?: ChartRange) =>
      storeBase.run(getAsset(pid, aid, range)),
    create: (pid: number, a: PostAsset) => storeBase.run(createAsset(pid, a)),
    update: (pid: number, aid: number, a: PostAsset) =>
      storeBase.run(updateAsset(pid, aid, a)),
    delete: (pid: number, aid: number) =>
      storeBase.run(
        pipe(
          deleteAsset(pid, aid),
          TE.map(() => null)
        )
      ),
  };
};
