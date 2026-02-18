import * as A from "fp-ts/lib/Array";
import { pipe, type FunctionN } from "fp-ts/lib/function";
import { Heap } from "heap-js";
import type { ChartDataPoint } from "../decoders/yahoo/chart";
import type { ChartRange } from "../decoders/yahoo/meta";
import type { ChartData, EnrichedAsset, EnrichedPortfolio } from "../domain";
import { onEmpty } from "../utils/array";

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
  <Item>(getter: (itm: Item) => { id: string; chart: ChartData }) =>
  (items: Item[]): ChartData => {
    const getId = (i: Item) => getter(i).id;
    const getChart = (i: Item) => getter(i).chart;

    type HeapItem = { id: string; point: ChartDataPoint };

    const heap = new Heap<HeapItem>(
      (a, b) => a.point.timestamp - b.point.timestamp
    );
    const heapInit: HeapItem[] = pipe(
      items,
      A.flatMap((item) =>
        pipe(
          item,
          getChart,
          A.map((point) => ({ id: getId(item), point }))
        )
      )
    );
    heap.init(heapInit);

    const allIds = new Set<string>(pipe(items, A.map(getId)));
    const lastSeenPoint = new Map<string, ChartDataPoint>(
      items.map((item) => [getId(item), getChart(item)[0]])
    );

    const points = [] as unknown as ChartData;

    while (heap.length) {
      const { timestamp } = heap.peek()!.point;
      const point: ChartDataPoint = { timestamp, price: 0, volume: 0 };
      const timeSlotIds = new Set<string>();
      while (heap.length && heap.peek()!.point.timestamp == timestamp) {
        const heapItem = heap.pop()!;
        lastSeenPoint.set(heapItem.id, heapItem.point);
        point.price += heapItem.point.price;
        point.volume += heapItem.point.volume;
        timeSlotIds.add(heapItem.id);
      }
      const missingIds = allIds.difference(timeSlotIds);

      missingIds.forEach((id) => {
        const lastSeenItem = lastSeenPoint.get(id)!;
        point.price += lastSeenItem.price;
        point.volume += lastSeenItem.volume;
      });

      points.push(point);
    }
    return pipe(
      points,
      onEmpty(() => ({ timestamp: 0, volume: 0, price: 0 }))
    );
  };

export const combineAssetCharts = combineCharts<EnrichedAsset>(
  ({ ticker, base }) => ({
    id: ticker,
    chart: base.chart
  })
);

export const combinePortfolioCharts = combineCharts<EnrichedPortfolio>((p) => ({
  id: `${p.id}${p.name}`,
  chart: p.base.chart
}));
