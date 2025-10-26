import type Database from "bun:sqlite";
import * as asset from "./asset";
import * as portfolio from "./portfolio";
import * as preferences from "./preferences";
import * as tx from "./transaction";
import * as user from "./user";

export type Repository = ReturnType<typeof createRepository>;

export const createRepository = (db: Database) => {
  return {
    asset: {
      get: asset.getAsset(db),
      getAll: asset.getAssets(db),
      create: asset.createAsset(db),
      delete: asset.deleteAsset(db),
      update: asset.updateAsset(db),
    },
    tx: {
      get: tx.getTx(db),
      getAll: tx.getTxs(db),
      create: tx.createTx(db),
      delete: tx.deleteTx(db),
      update: tx.updateTx(db),
    },
    portfolio: {
      get: portfolio.getPortfolio(db),
      getAll: portfolio.getPortfolios(db),
      create: portfolio.createPortfolio(db),
      delete: portfolio.deletePortfolio(db),
      update: portfolio.updatePortfolio(db),
    },
    user: {
      get: user.getUser(db),
      getAll: user.getUsers(db),
      create: user.createUser(db),
      update: user.updateUser(db),
      delete: user.deleteUser(db),
      loginAttempt: user.loginAttempt(db),
      loginSuccess: user.loginSuccess(db),
    },
    preference: {
      get: preferences.getPreference(db),
      update: preferences.updatePreference(db),
    },
  };
};
