import { createContext, useContext } from "react";
import { createAssetStore, type AssetStore } from "./asset";
import { createAssetsStore, type AssetsStore } from "./assets";
import { createAuthStore, type AuthStore } from "./auth";
import { createPortfolioStore, type PortfolioStore } from "./portfolio";
import { createPortfoliosStore, type PortfoliosStore } from "./portfolios";
import { createProfileStore, type ProfileStore } from "./profile";
import { createTxStore, type TxStore } from "./tx";
import { createTxsStore, type TxsStore } from "./txs";

export type Store = {
  tx: TxStore;
  txs: TxsStore;
  auth: AuthStore;
  asset: AssetStore;
  assets: AssetsStore;
  profile: ProfileStore;
  portfolio: PortfolioStore;
  portfolios: PortfoliosStore;
};

export const createStore = (): Store => ({
  tx: createTxStore(),
  txs: createTxsStore(),
  auth: createAuthStore(),
  asset: createAssetStore(),
  assets: createAssetsStore(),
  profile: createProfileStore(),
  portfolio: createPortfolioStore(),
  portfolios: createPortfoliosStore(),
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
