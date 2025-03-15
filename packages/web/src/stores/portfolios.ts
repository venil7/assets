import { signal } from "@preact/signals-react";
import { Portfolio } from "../../../assets-core/src/domain/portfolio";
import { Identity } from "../../../assets-core/src/domain/utils";
import { getPortfolios } from "../services/portfolio";
import { StoreBase, createStoreBase } from "./base";

export type PortfoliosStore = Identity<
  StoreBase<Portfolio[]> & {
    load: () => Promise<unknown>;
  }
>;

export const createPortfoliosStore = (): PortfoliosStore => {
  const data = signal<Portfolio[]>([]);
  const storeBase = createStoreBase(data);

  return {
    ...storeBase,
    load: () => storeBase.update(getPortfolios()),
  };
};
