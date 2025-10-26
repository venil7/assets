import type { LazyArg } from "fp-ts/lib/function";
import { readFileSync } from "node:fs";
import { normalize } from "node:path";

export const getSql = (fileName: string): LazyArg<string> => {
  const fname = `${__dirname}/sql/${normalize(fileName)}.sql`;
  const sql = readFileSync(fname).toString();
  return () => sql;
};

export const getAssetSql = getSql("asset/get");
export const getAssetsSql = getSql("asset/get-many");
export const insertAssetSql = getSql("asset/insert");
export const updateAssetSql = getSql("asset/update");
export const deleteAssetSql = getSql("asset/delete");

export const getPortfolioSql = getSql("portfolio/get");
export const getPortfoliosSql = getSql("portfolio/get-many");
export const insertPortfolioSql = getSql("portfolio/insert");
export const updatePortfolioSql = getSql("portfolio/update");
export const deletePortfolioSql = getSql("portfolio/delete");

export const getTxSql = getSql("transaction/get");
export const getTxsSql = getSql("transaction/get-many");
export const insertTxSql = getSql("transaction/insert");
export const updateTxSql = getSql("transaction/update");
export const deleteTxSql = getSql("transaction/delete");

export const getUserSql = getSql("user/get");
export const getUsersSql = getSql("user/get-many");
export const resetAttemptsSql = getSql("user/reset");
export const insertUserSql = getSql("user/insert");
export const updateUserSql = getSql("user/update");
export const deleteUserSql = getSql("user/delete");
export const getUnlockedUserSql = getSql("user/get-unlocked");
export const loginAttemptUserSql = getSql("user/login-attempt");

export const getPreferenceSql = getSql("preference/get");
export const updatePreferenceSql = getSql("preference/update");
