import {
  type EnrichedPortfolio,
  type PeriodChanges,
  type Summary,
  type Totals,
  type UnixDate,
  byDuration,
  DEFAULT_CHART_RANGE,
  onEmpty,
  sum,
  unixNow
} from "@darkruby/assets-core";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as Ord from "fp-ts/lib/Ord";
import { combinePortfolioCharts, commonPortfolioRanges } from "./chart";

export const enrichSummary = (portfolios: EnrichedPortfolio[]): Summary => {
  const chart = combinePortfolioCharts(portfolios);
  const meta = (() => {
    const range = pipe(
      portfolios,
      A.map((a) => a.meta.range),
      A.reduce(DEFAULT_CHART_RANGE, Ord.max(byDuration))
    );
    const validRanges = commonPortfolioRanges(portfolios);
    return { range, validRanges };
  })();

  const value: PeriodChanges = (() => {
    const startPrice = pipe(
      portfolios,
      sum(({ base }) => base.changes.startPrice)
    );
    const endPrice = pipe(
      portfolios,
      sum(({ base }) => base.changes.endPrice)
    );

    const returnValue = pipe(
      portfolios,
      sum((p) => p.base.changes.returnValue)
    );
    const returnPct = pipe(
      portfolios,
      sum((p) => p.base.changes.returnPct * p.weight)
    );

    const startTs = pipe(
      portfolios,
      A.map(({ base }) => base.changes.startTs),
      onEmpty(unixNow),
      (s) => Math.min(...s)
    ) as UnixDate;

    const endTs = pipe(
      portfolios,
      A.map(({ base }) => base.changes.endTs),
      onEmpty(unixNow),
      (s) => Math.max(...s)
    ) as UnixDate;

    return {
      startPrice,
      endPrice,
      returnValue,
      returnPct,
      startTs,
      endTs
    } satisfies PeriodChanges;
  })();

  const totals = ((): Totals => {
    const returnValue = pipe(
      portfolios,
      sum((p) => p.base.totals.returnValue)
    );
    const returnPct = pipe(
      portfolios,
      sum((p) => p.base.totals.returnPct * p.weight)
    );

    return { returnValue, returnPct };
  })();

  return { chart, meta, value, totals };
};
