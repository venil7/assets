import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as Ord from "fp-ts/lib/Ord";
import { ChartRangeOrd, DEFAULT_CHART_RANGE } from "../decoders/yahoo/meta";
import type {
  EnrichedPortfolio,
  PeriodChanges,
  Summary,
  Totals,
  UnixDate,
} from "../domain";
import { nonEmpty } from "../utils/array";
import { changeInValue, changeInValuePct, sum } from "../utils/finance";
import { combinePortfolioCharts, commonPortfolioRanges } from "./chart";

export const summarize = (portfolios: EnrichedPortfolio[]): Summary => {
  const chart = combinePortfolioCharts(portfolios);
  const meta = (() => {
    const range = pipe(
      portfolios,
      A.map((a) => a.meta.range),
      A.reduce(DEFAULT_CHART_RANGE, Ord.max(ChartRangeOrd))
    );
    const validRanges = commonPortfolioRanges(portfolios);
    return { range, validRanges };
  })();

  const investedBase = pipe(
    portfolios,
    sum(({ investedBase }) => investedBase)
  );

  const value: PeriodChanges = (() => {
    const beginning = pipe(
      portfolios,
      sum(({ value }) => value.beginning)
    );
    const current = pipe(
      portfolios,
      sum(({ value }) => value.current)
    );

    const change = changeInValue(beginning)(current);
    const changePct = changeInValuePct(beginning)(current);
    const start = pipe(
      portfolios,
      A.map(({ value }) => value.start),
      nonEmpty(() => Math.floor(new Date().getTime() / 1000)),
      (s) => Math.min(...s)
    ) as UnixDate;
    const end = pipe(
      portfolios,
      A.map(({ value }) => value.end),
      nonEmpty(() => Math.floor(new Date().getTime() / 1000)),
      (s) => Math.max(...s)
    ) as UnixDate;

    return {
      beginning,
      current,
      change,
      changePct,
      start,
      end,
    };
  })();

  const totals = ((): Totals => {
    const profitLoss = changeInValue(investedBase)(value.current);
    const profitLossPct = changeInValuePct(investedBase)(value.current);
    return { profitLoss, profitLossPct };
  })();

  return { chart, meta, value, totals };
};
