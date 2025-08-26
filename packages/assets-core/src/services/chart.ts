import { pipe, type FunctionN } from "fp-ts/lib/function";
import Heap from "heap-js";
import type { ChartDataPoint } from "../decoders/yahoo/chart";
import type { ChartRange } from "../decoders/yahoo/meta";
import type { ChartData, EnrichedAsset, EnrichedPortfolio } from "../domain";
import { nonEmpty } from "../utils/array";

const commonRanges =
  <Item>(getRanges: FunctionN<[Item], ChartRange[]>) =>
  (items: Item[]): ChartRange[] => {
    const rs = items.flatMap(getRanges);
    const s = new Set<ChartRange>(rs);
    return [...s.values()];
  };

export const commonAssetRanges = commonRanges<EnrichedAsset>(
  (a) => a.meta.validRanges
);

export const commonPortfolioRanges = commonRanges<EnrichedPortfolio>(
  (p) => p.meta.validRanges
);

const combineCharts =
  <Item>(
    getter: FunctionN<
      [Item],
      { ticker: string; chart: ChartData; price: number }
    >
  ) =>
  (items: Item[]): ChartData => {
    const getTicker = (i: Item) => getter(i).ticker;
    const getChart = (i: Item) => getter(i).chart;
    const getPrice = (i: Item) => getter(i).price;

    const heap = new Heap<{ point: ChartDataPoint; ticker: string }>(
      (a, b) => a.point.timestamp - b.point.timestamp
    );
    heap.init();
    items.forEach((item) =>
      heap.addAll(
        getChart(item).map(
          (point) => ({ point, ticker: getTicker(item) }) as const
        )
      )
    );
    const assetNames = items.map(getTicker);
    const assetDict = new Map(items.map((a) => [getTicker(a), a]));

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
        const p = assetDict.get(ticker)!;
        point.price += getPrice(p);
      });

      points.push(point);
    }
    return pipe(
      points,
      nonEmpty(() => ({ timestamp: 0, volume: 0, price: 0 }))
    );
  };

export const combineAssetCharts = combineCharts<EnrichedAsset>((a) => ({
  ticker: a.ticker,
  chart: a.chart.base,
  price: a.value.base.current,
}));

export const combinePortfolioCharts = combineCharts<EnrichedPortfolio>((p) => ({
  ticker: `${p.id}${p.name}`,
  chart: p.chart,
  price: p.value.current,
}));
