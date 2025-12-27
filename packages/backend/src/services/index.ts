import type { YahooApi } from "@darkruby/assets-core";
import type { Repository } from "../repository";
import * as asset from "./asset";
import * as auth from "./auth";
import * as portfolio from "./portfolio";
import * as prefs from "./prefs";
import * as tx from "./tx";
import * as user from "./user";

export type WebService = ReturnType<typeof createWebService>;

export const createWebService = (repo: Repository, yahooApi: YahooApi) => {
  return {
    auth: {
      createToken: auth.createToken,
      verifyBearer: auth.verifyBearer,
      requireUserId: auth.requireUserId,
      verifyPassword: auth.verifyPassword,
      requireProfile: auth.requireProfile,
      requireAdminProfile: auth.requireAdminProfile,
    },
    user: {
      get: user.getUser(repo),
      getMany: user.getUsers(repo),
      create: user.createUser(repo),
      delete: user.deleteUser(repo),
      updateProfileOnly: user.updateProfileOnly(repo),
      updateOwnProfileOnly: user.updateOwnProfileOnly(repo),
      updateOwnPasswordOnly: user.updateOwnPasswordOnly(repo),
    },
    assets: {
      get: asset.getAsset(repo, yahooApi),
      getMany: asset.getAssets(repo, yahooApi),
      delete: asset.deleteAsset(repo),
      create: asset.createAsset(repo, yahooApi),
      update: asset.updateAsset(repo, yahooApi),
    },
    portfolio: {
      get: portfolio.getPortfolio(repo, yahooApi),
      getMany: portfolio.getPortfolios(repo, yahooApi),
      delete: portfolio.deletePortfolio(repo),
      create: portfolio.createPortfolio(repo, yahooApi),
      update: portfolio.updatePortfolio(repo, yahooApi),
    },
    tx: {
      get: tx.getTx(repo),
      getMany: tx.getTxs(repo),
      delete: tx.deleteTx(repo),
      create: tx.createTx(repo),
      update: tx.updateTx(repo),
      uploadAssetTxs: tx.uploadAssetTxs(repo),
      deleteAllAsset: tx.deleteAllAssetTxs(repo),
    },
    prefs: {
      update: prefs.updatePrefs(repo),
    },
  };
};
