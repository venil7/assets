import type { HandlerTask } from "@darkruby/fp-express";
import { default as express } from "express";
import { pipe } from "fp-ts/lib/function";
import * as assets from "./asset";
import * as auth from "./auth";
import type { Context } from "./context";
import * as portfolio from "./portfolio";
import * as profile from "./profile";
import * as summary from "./summary";
import * as tx from "./transaction";
import * as user from "./user";
import * as yahoo from "./yahoo";

export type Handlers = ReturnType<typeof createHandlers>;
export const createHandlers = (
  expressify: (task: HandlerTask<unknown, Context>) => express.RequestHandler
) => ({
  portfolio: {
    get: pipe(portfolio.getPortfolio, expressify),
    getMany: pipe(portfolio.getPortfolios, expressify),
    create: pipe(portfolio.createPortfolio, expressify),
    update: pipe(portfolio.updatePortfolio, expressify),
    delete: pipe(portfolio.deletePortfolio, expressify),
  },
  assets: {
    get: pipe(assets.getAsset, expressify),
    getMany: pipe(assets.getAssets, expressify),
    create: pipe(assets.createAsset, expressify),
    update: pipe(assets.updateAsset, expressify),
    delete: pipe(assets.deleteAsset, expressify),
  },
  tx: {
    get: pipe(tx.getTx, expressify),
    getMany: pipe(tx.getTxs, expressify),
    create: pipe(tx.createTx, expressify),
    update: pipe(tx.updateTx, expressify),
    delete: pipe(tx.deleteTx, expressify),
  },
  user: {
    get: pipe(user.getUser, expressify),
    getMany: pipe(user.getUsers, expressify),
    create: pipe(user.createUser, expressify),
    update: pipe(user.updateUser, expressify),
    delete: pipe(user.deleteUser, expressify),
  },
  summary: {
    get: pipe(summary.getSummary, expressify),
  },
  profile: {
    get: pipe(profile.getOwnProfile, expressify),
    update: pipe(profile.updateOwnProfile, expressify),
  },
  auth: {
    login: pipe(auth.login, expressify),
    refreshToken: pipe(auth.refreshToken, expressify),
  },
  yahoo: {
    search: pipe(yahoo.yahooSearch, expressify),
  },
  middleware: {
    authenticate: pipe(auth.verifyToken, expressify),
  },
});
