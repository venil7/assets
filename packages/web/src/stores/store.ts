import { createContext } from "react";
import { createAssetStore, type AssetStore } from "./asset";
import { createAssetsStore, type AssetsStore } from "./assets";
import { createAuthStore, type AuthStore } from "./auth";
import { createPortfolioStore, type PortfolioStore } from "./portfolio";
import { createPortfoliosStore, type PortfoliosStore } from "./portfolios";
import { createPreferencesStore, type PreferencesStore } from "./preferences";
import { createProfileStore, type ProfileStore } from "./profile";
import { createSummaryStore, type SummaryStore } from "./summary";
import { createTxStore, type TxStore } from "./tx";
import { createTxsStore, type TxsStore } from "./txs";
import { createUsersStore, type UsersStore } from "./users";

export type Store = {
  tx: TxStore;
  txs: TxsStore;
  auth: AuthStore;
  asset: AssetStore;
  users: UsersStore;
  assets: AssetsStore;
  summary: SummaryStore;
  profile: ProfileStore;
  portfolio: PortfolioStore;
  portfolios: PortfoliosStore;
  preferences: PreferencesStore;
};

export const createStore = (): Store => ({
  tx: createTxStore(),
  txs: createTxsStore(),
  auth: createAuthStore(),
  users: createUsersStore(),
  asset: createAssetStore(),
  assets: createAssetsStore(),
  summary: createSummaryStore(),
  profile: createProfileStore(),
  portfolio: createPortfolioStore(),
  portfolios: createPortfoliosStore(),
  preferences: createPreferencesStore(),
});

export const createStoreContext = (): [Store, React.Context<Store>] => {
  const store = createStore();
  const context = createContext<Store>(store);
  return [store, context];
};
