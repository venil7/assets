import type { Action, GetPortfolio } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { apiFromToken } from "./api";

export const getPortfolios = (): Action<GetPortfolio[]> => {
  return pipe(
    apiFromToken,
    TE.chain((a) => a.getPortfolios())
  );
};

export const getPortfolioDetails = (id: number) => {
  return pipe(
    apiFromToken,
    TE.bindTo("api"),
    TE.bind("portfolio", ({ api }) => api.getPortfolio(id)),
    TE.bind("assets", ({ api }) => api.getAssets(id)),
    TE.map(({ portfolio, assets }) => ({ ...portfolio, assets }))
  );
};
