import * as A from "fp-ts/lib/Array";
import { pipe, type FunctionN } from "fp-ts/lib/function";
import { Heap } from "heap-js";
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
    const getIdentifier = (i: Item) => getter(i).ticker;
    const getChart = (i: Item) => getter(i).chart;

    type HeapItem = { identifier: string; point: ChartDataPoint };

    const heap = new Heap<HeapItem>(
      (a, b) => a.point.timestamp - b.point.timestamp
    );
    const heapInit: HeapItem[] = pipe(
      items,
      A.flatMap((item) =>
        pipe(
          item,
          getChart,
          A.map((point) => ({ identifier: getIdentifier(item), point }))
        )
      )
    );
    heap.init(heapInit);

    const allIdentifiers = new Set<string>(pipe(items, A.map(getIdentifier)));
    const lastSeenPoint = new Map<string, ChartDataPoint>(
      items.map((item) => [getIdentifier(item), getChart(item)[0]])
    );

    const points = [] as unknown as ChartData;

    while (heap.length) {
      const { timestamp } = heap.peek()!.point;
      const point: ChartDataPoint = { timestamp, price: 0, volume: 0 };
      const timeSlotIdentifiers = new Set<string>();
      while (heap.length && heap.peek()!.point.timestamp == timestamp) {
        const heapItem = heap.pop()!;
        lastSeenPoint.set(heapItem.identifier, heapItem.point);
        point.price += heapItem.point.price;
        point.volume += heapItem.point.volume;
        timeSlotIdentifiers.add(heapItem.identifier);
      }
      const missingIdentifiers = allIdentifiers.difference(timeSlotIdentifiers);

      missingIdentifiers.forEach((identifier) => {
        const lastSeenItem = lastSeenPoint.get(identifier)!;
        point.price += lastSeenItem.price;
        point.volume += lastSeenItem.volume;
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
