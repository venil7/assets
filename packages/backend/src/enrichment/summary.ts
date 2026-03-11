import {
  type EnrichedPortfolio,
  type PeriodChanges,
  type Summary,
  type Totals,
  type UnixDate,
  byDuration,
  DEFAULT_CHART_RANGE,
  max,
  min,
  sum
} from "@darkruby/assets-core";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as Ord from "fp-ts/lib/Ord";
import { combinePortfolioCharts, commonPortfolioRanges } from "./chart";

const summaryMeta = (portfolios: EnrichedPortfolio[]): Summary["meta"] => {
  const range = pipe(
    portfolios,
    A.map((a) => a.meta.range),
    A.reduce(DEFAULT_CHART_RANGE, Ord.max(byDuration))
  );
  const validRanges = commonPortfolioRanges(portfolios);
  const fiftyTwoWeekLow = 0;
  const fiftyTwoWeekHigh = 0;
  const volatilityRange = 0;
  const volatilityPct = 0;
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
    min<EnrichedPortfolio>((p) => p.changes.startTs)
  ) as UnixDate;

  const endTs = pipe(
    portfolios,
    max<EnrichedPortfolio>((p) => p.changes.endTs)
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
  const returnValue = pipe(
    portfolios,
    sum(({ totals }) => totals.returnValue)
  );
  const returnPct = pipe(
    portfolios,
    sum(({ totals, weight }) => totals.returnPct * (weight ?? 0))
  );

  return { returnValue, returnPct };
};

export const enrichSummary = (portfolios: EnrichedPortfolio[]): Summary => {
  const chart = combinePortfolioCharts(portfolios);
  const meta = summaryMeta(portfolios);
  const changes = summaryChanges(portfolios);
  const totals = summaryTotals(portfolios);

  return { chart, meta, changes, totals };
};
