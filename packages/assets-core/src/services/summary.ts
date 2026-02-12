import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as Ord from "fp-ts/lib/Ord";
import { byDuration, DEFAULT_CHART_RANGE } from "../decoders/yahoo/meta";
import type {
  EnrichedPortfolio,
  PeriodChanges,
  Summary,
  Totals,
  UnixDate
} from "../domain";
import { onEmpty } from "../utils/array";
import { unixNow } from "../utils/date";
import { sum } from "../utils/finance";
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
    const beginning = pipe(
      portfolios,
      sum(({ base }) => base.changes.beginning)
    );
    const current = pipe(
      portfolios,
      sum(({ base }) => base.changes.current)
    );
    const returnValue = pipe(
      portfolios,
      sum((p) => p.base.changes.returnValue)
    );
    const returnPct = pipe(
      portfolios,
      sum((p) => p.base.changes.returnPct * p.weight)
    );

    const start = pipe(
      portfolios,
      A.map(({ base }) => base.changes.start),
      onEmpty(unixNow),
      (s) => Math.min(...s)
    ) as UnixDate;

    const end = pipe(
      portfolios,
      A.map(({ base }) => base.changes.end),
      onEmpty(unixNow),
      (s) => Math.max(...s)
    ) as UnixDate;

    return {
      beginning,
      current,
      returnValue,
      returnPct,
      start,
      end
    };
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
