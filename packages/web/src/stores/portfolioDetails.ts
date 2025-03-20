import type {
  GetAsset,
  GetPortfolio,
  Identity,
  Nullable,
} from "@darkruby/assets-core";
import { signal } from "@preact/signals-react";
import { getPortfolioDetails } from "../services/portfolio";
import { type StoreBase, createStoreBase } from "./base";

export type PortfolioDetailsStore = Identity<
  StoreBase<Nullable<GetPortfolio & { assets: GetAsset[] }>> & {
    load: (id: number, force?: boolean) => Promise<unknown>;
  }
>;

export const createPortfolioDetailsStore = (): PortfolioDetailsStore => {
  const data = signal<Nullable<GetPortfolio & { assets: GetAsset[] }>>(null);
  const storeBase = createStoreBase(data);

  return {
    ...storeBase,
    load: (id, force = true) =>
      storeBase.update(getPortfolioDetails(id), force),
  };
};
