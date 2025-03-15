import { createPortfoliosStore, PortfoliosStore } from "./portfolios";

export type Store = {
  portfolios: PortfoliosStore;
};

export const createStore = (): Store => ({
  portfolios: createPortfoliosStore(),
});
