import type {
  EnrichedPortfolio,
  Identity,
  Result,
} from "@darkruby/assets-core";
import { signal } from "@preact/signals-react";
import { getPortfolios } from "../services/portfolio";
import { type StoreBase, createStoreBase } from "./base";

export type PortfoliosStore = Identity<
  StoreBase<EnrichedPortfolio[]> & {
    load: (force?: boolean) => Promise<Result<EnrichedPortfolio[]>>;
  }
>;

export const createPortfoliosStore = (): PortfoliosStore => {
  const data = signal<EnrichedPortfolio[]>([]);
  const storeBase = createStoreBase(data, (t) => !!t.length);

  return {
    ...storeBase,
    load: (force = false) => storeBase.update(getPortfolios(), force),
  };
};
