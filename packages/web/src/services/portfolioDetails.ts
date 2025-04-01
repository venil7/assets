import {
  type Action,
  type PostAsset,
  type PostPortfolio,
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import {
  portfolioDetails,
  type PortfolioDetails,
} from "../domain/portfolioDetails";
import { apiFromToken } from "./api";
import { createAsset, deleteAsset, updateAsset } from "./assets";
import { updatePortfolio } from "./portfolios";

export const getPortfolioDetails = (pid: number): Action<PortfolioDetails> => {
  return pipe(
    TE.Do,
    TE.apS("api", apiFromToken),
    TE.bind("portfolio", ({ api }) => api.portfolio.get(pid)),
    TE.bind("assets", ({ api }) => api.asset.getMany(pid)),
    TE.map(({ portfolio, assets }) => portfolioDetails(portfolio, assets))
  );
};

export const createPdAsset = (
  pid: number,
  a: PostAsset
): Action<PortfolioDetails> => {
  return pipe(
    createAsset(pid, a),
    TE.chain(() => getPortfolioDetails(pid))
  );
};

export const updatePdAsset = (
  pid: number,
  aid: number,
  a: PostAsset
): Action<PortfolioDetails> => {
  return pipe(
    updateAsset(pid, aid, a),
    TE.chain(() => getPortfolioDetails(pid))
  );
};

export const deletePdAsset = (
  pid: number,
  aid: number
): Action<PortfolioDetails> => {
  return pipe(
    deleteAsset(pid, aid),
    TE.chain(() => getPortfolioDetails(pid))
  );
};

export const updatePdPortfolio = (
  pid: number,
  p: PostPortfolio
): Action<PortfolioDetails> => {
  return pipe(
    updatePortfolio(pid, p),
    TE.chain(() => getPortfolioDetails(pid))
  );
};
