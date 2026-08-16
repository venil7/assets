import {
  byPortfolioChangePct,
  type Action,
  type EnrichedPortfolio,
  type Id,
  type PostPortfolio
} from "@darkruby/assets-core";
import type { ChartRange } from "@darkruby/assets-core/src/decoders/yahoo/meta";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { apiFromToken } from "./api";

const get = (pid: number, range?: ChartRange): Action<EnrichedPortfolio> => {
  return pipe(
    apiFromToken,
    TE.chain(({ portfolio }) => portfolio.get(pid, range))
  );
};

const getMany = (range?: ChartRange): Action<EnrichedPortfolio[]> => {
  return pipe(
    apiFromToken,
    TE.chain(({ portfolio: p }) => p.getMany(range)),
    TE.map(A.sort(byPortfolioChangePct))
  );
};

const update = (pid: number, p: PostPortfolio): Action<EnrichedPortfolio> => {
  return pipe(
    apiFromToken,
    TE.chain(({ portfolio }) => portfolio.update(pid, p))
  );
};

const create = (p: PostPortfolio): Action<EnrichedPortfolio> => {
  return pipe(
    apiFromToken,
    TE.chain(({ portfolio }) => portfolio.create(p))
  );
};

const delete1 = (portfolioId: number): Action<Id> => {
  return pipe(
    apiFromToken,
    TE.chain(({ portfolio }) => portfolio.delete(portfolioId))
  );
};

export const portfolios = {
  get,
  getMany,
  create,
  update,
  delete: delete1
};
