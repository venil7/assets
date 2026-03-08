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
  })() satisfies EnrichedPortfolio["meta"];

  const value: PeriodChanges = (() => {
    const startPrice = pipe(
      portfolios,
      sum(({ changes }) => changes.startPrice)
    );
    const endPrice = pipe(
      portfolios,
      sum(({ changes }) => changes.endPrice)
    );

    const returnValue = pipe(
      portfolios,
      sum(({ changes }) => changes.returnValue)
    );
    const returnPct = pipe(
      portfolios,
      sum(({ changes, weight }) => changes.returnPct * (weight ?? 0))
    );

    const startTs = pipe(
      portfolios,
      A.map(({ changes }) => changes.startTs),
      onEmpty(unixNow),
      (s) => Math.min(...s)
    ) as UnixDate;

    const endTs = pipe(
      portfolios,
      A.map(({ changes }) => changes.endTs),
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
      sum(({ totals }) => totals.returnValue)
    );
    const returnPct = pipe(
      portfolios,
      sum(({ totals, weight }) => totals.returnPct * (weight ?? 0))
    );

    return { returnValue, returnPct };
  })();

  return { chart, meta, value, totals };
};
