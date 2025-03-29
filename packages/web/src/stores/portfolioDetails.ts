import type { Identity, Nullable } from "@darkruby/assets-core";
import { signal } from "@preact/signals-react";
import type { PortfolioDetails } from "../domain/portfolioDetails";
import { getPortfolioDetails } from "../services/portfolio";
import { type StoreBase, createStoreBase } from "./base";

export type PortfolioDetailsStore = Identity<
  StoreBase<Nullable<PortfolioDetails>> & {
    load: (id: number, force?: boolean) => Promise<unknown>;
  }
>;

export const createPortfolioDetailsStore = (): PortfolioDetailsStore => {
  const data = signal<Nullable<PortfolioDetails>>(null);
  const storeBase = createStoreBase(data);

  return {
    ...storeBase,
    load: (id, force = true) =>
      storeBase.update(getPortfolioDetails(id), force),
  };
};
