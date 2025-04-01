import { createContext, useContext } from "react";
import {
  createAssetDetailsStore,
  type AssetDetailsStore,
} from "./assetDetails";
import { createAuthStore, type AuthStore } from "./auth";
import {
  createPortfolioDetailsStore,
  type PortfolioDetailsStore,
} from "./portfolioDetails";
import { createPortfoliosStore, type PortfoliosStore } from "./portfolios";
import { createProfileStore, type ProfileStore } from "./profile";

export type Store = {
  auth: AuthStore;
  portfolios: PortfoliosStore;
  portfolioDetails: PortfolioDetailsStore;
  assetDetails: AssetDetailsStore;
  profile: ProfileStore;
};

export const createStore = (): Store => ({
  auth: createAuthStore(),
  portfolios: createPortfoliosStore(),
  portfolioDetails: createPortfolioDetailsStore(),
  assetDetails: createAssetDetailsStore(),
  profile: createProfileStore(),
});

export const createStoreContext = (): [Store, React.Context<Store>] => {
  const store = createStore();
  const context = createContext<Store>(store);
  return [store, context];
};

export const [store, StoreContext] = createStoreContext();

export const useStore = () => {
  return useContext(StoreContext);
};
