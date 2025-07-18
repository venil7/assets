import {
  byPortfolioChangePct,
  type Action,
  type EnrichedPortfolio,
  type Id,
  type PostPortfolio,
} from "@darkruby/assets-core";
import type { ChartRange } from "@darkruby/assets-core/src/decoders/yahoo/meta";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { apiFromToken } from "./api";

export const getPortfolio = (
  pid: number,
  range?: ChartRange
): Action<EnrichedPortfolio> => {
  return pipe(
    apiFromToken,
    TE.chain(({ portfolio }) => portfolio.get(pid, range))
  );
};

export const getPortfolios = (): Action<EnrichedPortfolio[]> => {
  return pipe(
    apiFromToken,
    TE.chain(({ portfolio: p }) => p.getMany()),
    TE.map(A.sort(byPortfolioChangePct))
  );
};

export const updatePortfolio = (
  pid: number,
  p: PostPortfolio
): Action<EnrichedPortfolio> => {
  return pipe(
    apiFromToken,
    TE.chain(({ portfolio }) => portfolio.update(pid, p))
  );
};

export const createPortfolio = (
  p: PostPortfolio
): Action<EnrichedPortfolio> => {
  return pipe(
    apiFromToken,
    TE.chain(({ portfolio }) => portfolio.create(p))
  );
};

export const deletePortfolio = (portfolioId: number): Action<Id> => {
  return pipe(
    apiFromToken,
    TE.chain(({ portfolio }) => portfolio.delete(portfolioId))
  );
};
