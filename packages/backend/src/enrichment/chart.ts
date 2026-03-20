import type {
  ChartData,
  ChartDataPoint,
  ChartRange,
  EnrichedAsset,
  EnrichedPortfolio,
  FxRates,
  GetTx,
  MultiChartData
} from "@darkruby/assets-core";
import {
  defaultBuyTx,
  EARLIEST_DATE,
  EARLIEST_TS,
  onEmpty,
  unixNow
} from "@darkruby/assets-core";
import * as A from "fp-ts/lib/Array";
import { flow, pipe, type FunctionN } from "fp-ts/lib/function";
import * as R from "fp-ts/lib/Record";
import { fromEntries } from "fp-ts/lib/Record";
import { Heap } from "heap-js";
import { col, DataFrame, readRecords, Series } from "nodejs-polars";
import { ChartSchema, RateRecSchema } from "./schema";

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
      const point: ChartDataPoint = {
        timestamp,
        price: 0,
        volume: 0,
        tx: null
      };
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
      onEmpty<ChartDataPoint>(() => ({
        timestamp: unixNow(),
        volume: 0,
        price: 0,
        tx: undefined
      }))
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
  chart: p.chart
}));

const combineChartsAlt = (charts: ChartData[]): ChartData => {
  if (charts.length < 1)
    return [{ timestamp: unixNow(), volume: 0, price: 0, tx: null }];
  const [init, ...rest] = charts;
  const combine = (df1: DataFrame, df2: DataFrame): DataFrame => {
    const ret = df1
      .join(df2, { on: "timestamp", how: "full", coalesce: true, suffix: "2" })
      .sort("timestamp")
      .withColumns(
        col("price").backwardFill().forwardFill(),
        col("price2").backwardFill().forwardFill(),
        col("volume").backwardFill().forwardFill(),
        col("volume2").backwardFill().forwardFill()
      )
      .select(
        col("timestamp"),
        col("price").plus(col("price2")).alias("price"),
        col("volume").plus(col("volume2")).alias("volume")
      );
    return ret;
  };
  return pipe(
    rest,
    A.map((c) => readRecords(c, { schema: ChartSchema })),
    A.reduce(readRecords(init, { schema: ChartSchema }), combine),
    (d) => d.toRecords()
  ) as unknown as ChartData;
};

export const combineAssetChartsAlt = flow(
  A.map<EnrichedAsset, ChartData>(({ base }) => base.chart),
  combineChartsAlt
);
export const combinePortfolioChartsAlt = flow(
  A.map<EnrichedPortfolio, ChartData>(({ chart }) => chart),
  combineChartsAlt
);

export const enrichChart = (chart: ChartData, txs: GetTx[]): ChartData => {
  let txi = 0; // current tx index

  const earliestChartTs = chart[0]?.timestamp ?? unixNow();
  const earliestTxTs = txs[0]?.timestamp;
  if (!earliestTxTs) {
    // no transactions exist for this asset;
    // chart will just be showing price per 1 unit
    txs = [
      {
        ...defaultBuyTx(EARLIEST_DATE),
        timestamp: EARLIEST_TS,
        quantity: 1,
        running_holding: 1
      } as GetTx
    ];
  } else if (earliestTxTs < earliestChartTs) {
    // there are transaction earlier that chart begins
    // we need to fast forward until tx just before chart begins
    while (
      txi + 1 < txs.length &&
      txs[txi + 1].timestamp < chart[0].timestamp
    ) {
      txi += 1;
    }
  } else if (earliestTxTs > earliestChartTs) {
    // chart starts earlier than earliest transaction
    // chart will be showing zero units until first transaction is encountered
    txs = [
      {
        ...defaultBuyTx(EARLIEST_DATE),
        timestamp: EARLIEST_TS,
        running_holding: 0
      } as GetTx,
      ...txs
    ];
  }

  const res: ChartDataPoint[] = [];
  const used = A.makeBy(txs.length, (i) => txs[i].timestamp < earliestChartTs);
  const useTx = (i: number) => {
    if (i >= 0 && i <= txs.length - 1 && !used[i]) {
      used[i] = true;
      return txs[i];
    }
    return null;
  };
  for (let point of chart) {
    let currentTx = txs[txi];
    const isLastTx = txi == txs.length - 1;
    if (isLastTx) {
      res.push({
        ...point,
        price: point.price * currentTx.running_holding,
        tx: useTx(txi)
      });
      continue;
    }
    const nextTx = txs[txi + 1];
    if (point.timestamp >= nextTx.timestamp) {
      txi += 1;
      currentTx = nextTx;
    }
    res.push({
      ...point,
      tx: useTx(txi),
      price: point.price * currentTx.running_holding
    });
  }
  return res as ChartData;
};

export const chartInBaseCcy = (
  chart: ChartData,
  fxRates: FxRates
): ChartData => {
  const $C = readRecords(chart, { schema: ChartSchema });
  const $R = readRecords(fxRates.rates, { schema: RateRecSchema });
  return $C
    .joinAsof($R, { on: "timestamp", strategy: "nearest" }) //? nearest is questionable
    .select(
      col("price").divideBy(col("rate")).alias("price"),
      col("timestamp"),
      col("volume"),
      col("tx")
    )
    .toRecords() as ChartData;
};

const combineMultiChart =
  <Item>(getter: (itm: Item) => { id: string; chart: ChartData }) =>
  (items: Item[]): MultiChartData => {
    const entries = pipe(
      items,
      A.map((i) => {
        const { id, chart } = getter(i);
        return [id, readRecords(chart, { schema: ChartSchema })] as [
          string,
          DataFrame
        ];
      })
    );
    const $ts = pipe(
      entries,
      A.reduce(
        Series("timestamp", [], ChartSchema.timestamp),
        ($acc, [, $chartData]) =>
          $acc.extend($chartData.getColumn("timestamp")) as typeof $acc
      )
    )
      .sort()
      .unique();

    const $init = DataFrame([$ts]);

    return pipe(
      entries,
      fromEntries<DataFrame>,
      R.map(($chartData) => {
        return $init
          .join($chartData, { on: "timestamp", how: "left" })
          .select(
            col("timestamp"),
            col("price").forwardFill().backwardFill(),
            col("volume").forwardFill().backwardFill(),
            col("tx")
          )
          .toRecords() as ChartData;
      })
    );
  };

export const combineAssetsMultiChart = combineMultiChart<EnrichedAsset>(
  ({ name, base }) => ({
    id: name,
    chart: base.chart
  })
);

// export const combineSummaryMultiChart = combineMultiChart<EnrichedAsset>(
//   (a) => ({
//     id: a.name,
//     chart: a.base.chart
//   })
// );
