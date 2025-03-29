import type { EnrichedAsset, Identity, Nullable } from "@darkruby/assets-core";
import { signal } from "@preact/signals-react";
import { getAsset } from "../services/asset";
import { type StoreBase, createStoreBase } from "./base";

export type AssetDetailsStore = Identity<
  StoreBase<Nullable<EnrichedAsset>> & {
    load: (
      portfolioId: number,
      id: number,
      force?: boolean
    ) => Promise<unknown>;
  }
>;

export const createAssetDetailsStore = (): AssetDetailsStore => {
  const data = signal<Nullable<EnrichedAsset>>(null);
  const storeBase = createStoreBase(data);

  return {
    ...storeBase,
    load: (portfolioId: number, id: number, force = true) =>
      storeBase.update(getAsset(portfolioId, id), force),
  };
};
