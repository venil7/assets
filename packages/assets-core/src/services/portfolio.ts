import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import Heap from "heap-js";
import type { ChartDataPoint } from "../decoders/yahoo/chart";
import type {
  ChartData,
  EnrichedAsset,
  EnrichedPortfolio,
  GetPortfolio,
  PeriodChanges,
  Totals,
} from "../domain";
import { nonEmpty } from "../utils/array";
import { changeInValue, changeInValuePct, sum } from "../utils/finance";
import type { Action, Optional } from "../utils/utils";
import { calcAssetWeights } from "./asset";

export const enrichPortfolio = (
  portfolio: GetPortfolio,
  getEnrichedAssets: () => Action<EnrichedAsset[]>
): Action<EnrichedPortfolio> => {
  return pipe(
    TE.Do,
    TE.apS("portfolio", TE.of(portfolio)),
    TE.bind("assets", () =>
      pipe(getEnrichedAssets(), TE.map(calcAssetWeights))
    ),
    TE.map(({ portfolio, assets }) => {
      const value: PeriodChanges = (() => {
        const beginning = pipe(
          assets,
          sum(({ value }) => value.base.beginning)
        );
        const current = pipe(
          assets,
          sum(({ value }) => value.base.current)
        );

        const change = changeInValue(beginning)(current);
        const changePct = changeInValuePct(beginning)(current);
        const start = pipe(
          assets,
          A.map(({ value }) => value.ccy.start),
          nonEmpty(() => Math.floor(new Date().getTime() / 1000)),
          (s) => Math.min(...s)
        );
        const end = pipe(
          assets,
          A.map(({ value }) => value.ccy.end),
          nonEmpty(() => Math.floor(new Date().getTime() / 1000)),
          (s) => Math.max(...s)
        );

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
        const profitLoss = pipe(
          assets,
          sum(({ totals }) => totals.base.profitLoss)
        );
        const profitLossPct = pipe(
          assets,
          sum(({ totals, value }) => {
            return totals.base.profitLossPct * value.weight;
          })
        );
        return { profitLoss, profitLossPct };
      })();

      const chart = portfolioChart(assets);

      return {
        ...portfolio,
        value,
        totals,
        chart,
        // weight cannot be calc
        // for single portfolio
        weight: 0,
      };
    })
  );
};

export const enrichedPortfolios = (
  portfolios: GetPortfolio[],
  f: (p: GetPortfolio) => Action<EnrichedAsset[]>
) =>
  pipe(
    portfolios,
    TE.traverseArray((p) => enrichPortfolio(p, () => f(p))),
    TE.map((ps) => calcPortfolioWeights(ps as EnrichedPortfolio[]))
  ) as Action<EnrichedPortfolio[]>;

export const enrichedOptionalPortfolio = (
  p: Optional<GetPortfolio>,
  getEnrichedAssets: () => Action<EnrichedAsset[]>
) => (p ? enrichPortfolio(p, getEnrichedAssets) : TE.of(null));

export const calcPortfolioWeights = (
  portfolios: EnrichedPortfolio[]
): EnrichedPortfolio[] => {
  const total = pipe(
    portfolios,
    sum(({ value }) => value.current)
  );
  return pipe(
    portfolios,
    A.map((p) => {
      if (total > 0) {
        p.weight = p.value.current / total;
      }
      return p;
    })
  );
};

export const portfolioChart = (as: EnrichedAsset[]): ChartData => {
  const heap = new Heap<{ point: ChartDataPoint; ticker: string }>(
    (a, b) => a.point.timestamp - b.point.timestamp
  );
  heap.init();
  as.forEach((a) =>
    heap.addAll(
      a.chart.base.map((p) => ({ point: p, ticker: a.ticker } as const))
    )
  );
  const assetNames = as.map((a) => a.ticker);
  const assetDict = new Map(as.map((a) => [a.ticker, a]));

  const points = [] as unknown as ChartData;

  while (heap.length) {
    const set = new Set(assetNames);
    const { point, ticker } = heap.pop()!;
    set.delete(ticker);
    while (set.size > 0) {
      if (!heap.length) break;
      if (heap.peek()!.point.timestamp == point.timestamp) {
        const {
          point: { price, volume },
          ticker,
        } = heap.pop()!;
        point.price += price;
        point.volume += volume;
        set.delete(ticker);
      } else break;
    }

    set.forEach((ticker) => {
      const ts = point.timestamp;
      const p = assetDict.get(ticker)!;
      point.price += p.value.base.current;
    });

    points.push(point);
  }
  return pipe(
    points,
    nonEmpty(() => ({ timestamp: 0, volume: 0, price: 0 }))
  );
};
