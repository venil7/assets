import type { Action, EnrichedPortfolio } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import type { PortfolioDetails } from "../domain/portfolioDetails";
import { apiFromToken } from "./api";

export const getPortfolios = (): Action<EnrichedPortfolio[]> => {
  return pipe(
    apiFromToken,
    TE.chain(({ portfolio: p }) => p.getMany())
  );
};

export const getPortfolioDetails = (id: number): Action<PortfolioDetails> => {
  return pipe(
    apiFromToken,
    TE.bindTo("api"),
    TE.bind("portfolio", ({ api }) => api.portfolio.get(id)),
    TE.bind("assets", ({ api }) => api.asset.getMany(id)),
    TE.map(({ portfolio, assets }) => ({ ...portfolio, assets }))
  );
};
