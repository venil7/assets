import {
  type EnrichedPortfolio,
  type EnrichedSummary,
  type PeriodChanges,
  type Totals,
  type UnixDate,
  byDuration,
  calcCumulativePnl,
  DEFAULT_CHART_RANGE,
  maxTs,
  minTs,
  sum,
  volatility
} from "@darkruby/assets-core";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as Ord from "fp-ts/lib/Ord";
import { combinePortfolioChartsAlt, commonPortfolioRanges } from "./chart";

const summaryMeta = (
  portfolios: EnrichedPortfolio[]
): EnrichedSummary["meta"] => {
  const range = pipe(
    portfolios,
    A.map((a) => a.meta.range),
    A.reduce(DEFAULT_CHART_RANGE, Ord.max(byDuration))
  );
  const validRanges = commonPortfolioRanges(portfolios);

  const fiftyTwoWeekLow = pipe(
    portfolios,
    sum((p) => p.meta.fiftyTwoWeekHigh)
  );
  const fiftyTwoWeekHigh = pipe(
    portfolios,
    sum((p) => p.meta.fiftyTwoWeekLow)
  );
  const [volatilityRange, volatilityPct] = volatility(
    fiftyTwoWeekLow,
    fiftyTwoWeekHigh
  );
  const currencies = <string[]>[];
  const exchanges = <string[]>[];
  const types = <string[]>[];
  return {
    range,
    validRanges,
    fiftyTwoWeekLow,
    fiftyTwoWeekHigh,
    volatilityRange,
    volatilityPct,
    currencies,
    exchanges,
    types
  };
};

const summaryChanges = (portfolios: EnrichedPortfolio[]): PeriodChanges => {
  const startPrice = pipe(
    portfolios,
    sum(({ changes }) => changes.startPrice)
  );
  const endPrice = pipe(
    portfolios,
    sum(({ changes }) => changes.endPrice)
  );

  const [returnValue, returnPct] = pipe(
    portfolios,
    calcCumulativePnl<EnrichedPortfolio>((a) => a.changes)
  );

  const startTs = pipe(
    portfolios,
    minTs<EnrichedPortfolio>((p) => p.changes.startTs)
  ) as UnixDate;

  const endTs = pipe(
    portfolios,
    maxTs<EnrichedPortfolio>((p) => p.changes.endTs)
  ) as UnixDate;

  return {
    startPrice,
    endPrice,
    returnValue,
    returnPct,
    startTs,
    endTs
  } satisfies PeriodChanges;
};

const summaryTotals = (portfolios: EnrichedPortfolio[]): Totals => {
  const [returnValue, returnPct] = pipe(
    portfolios,
    calcCumulativePnl<EnrichedPortfolio>((p) => p.totals)
  );
  return { returnValue, returnPct };
};

export const enrichSummary = (
  portfolios: EnrichedPortfolio[]
): EnrichedSummary => {
  const invested = pipe(
    portfolios,
    sum((p) => p.invested)
  );
  const fxImpact = pipe(
    portfolios,
    sum((p) => p.fxImpact)
  );
  const realizedPnl = pipe(
    portfolios,
    sum((p) => p.realizedPnl)
  );
  const breakEven = pipe(
    portfolios,
    sum((p) => p.breakEven)
  );

  const chart = combinePortfolioChartsAlt(portfolios);

  const meta = summaryMeta(portfolios);
  const changes = summaryChanges(portfolios);
  const totals = summaryTotals(portfolios);

  return {
    chart,
    meta,
    changes,
    totals,
    invested,
    fxImpact,
    realizedPnl,
    breakEven
  };
};
