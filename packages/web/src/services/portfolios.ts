import {
  type Action,
  type EnrichedPortfolio,
  type PostPortfolio,
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { apiFromToken } from "./api";

export const getPortfolios = (): Action<EnrichedPortfolio[]> => {
  return pipe(
    apiFromToken,
    TE.chain(({ portfolio: p }) => p.getMany())
  );
};

export const createPortfolio = (
  p: PostPortfolio
): Action<EnrichedPortfolio[]> => {
  return pipe(
    TE.Do,
    TE.apS("api", apiFromToken),
    TE.bind("create", ({ api }) => api.portfolio.create(p)),
    TE.chain(({ api }) => api.portfolio.getMany())
  );
};

export const updatePortfolio = (
  portfolioId: number,
  p: PostPortfolio
): Action<EnrichedPortfolio[]> => {
  return pipe(
    TE.Do,
    TE.apS("api", apiFromToken),
    TE.bind("create", ({ api }) => api.portfolio.update(portfolioId, p)),
    TE.chain(({ api }) => api.portfolio.getMany())
  );
};

export const deletePortfolio = (
  portfolioId: number
): Action<EnrichedPortfolio[]> => {
  return pipe(
    TE.Do,
    TE.apS("api", apiFromToken),
    TE.bind("create", ({ api }) => api.portfolio.delete(portfolioId)),
    TE.chain(({ api }) => api.portfolio.getMany())
  );
};
