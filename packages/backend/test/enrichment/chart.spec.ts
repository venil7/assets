import {
  defaultBuyTx,
  EARLIEST_DATE,
  EARLIEST_TS,
  type ChartData,
  type ChartDataPoint,
  type EnrichedAsset,
  type GetTx,
  type UnixDate
} from "@darkruby/assets-core";
import { expect, test } from "bun:test";
import {
  combineAssetCharts,
  commonAssetRanges,
  enrichChart
} from "../../src/enrichment/chart";

const pt = (timestamp: number, price: number, volume = 0): ChartDataPoint => ({
  timestamp: timestamp as UnixDate,
  price,
  volume,
  tx: null
});

const asset = (ticker: string, chart: ChartDataPoint[]): EnrichedAsset =>
  ({ ticker, base: { chart } }) as unknown as EnrichedAsset;

const chart = (prices: readonly (readonly [number, number])[]): ChartData =>
  prices.map(([ts, price]) => pt(ts, price)) as ChartData;

const tx = (timestamp: number, running_holding: number, quantity = 1): GetTx =>
  ({
    ...defaultBuyTx(EARLIEST_DATE),
    timestamp: timestamp as UnixDate,
    running_holding,
    quantity
  }) as unknown as GetTx;

test("commonAssetRanges returns the deduped union of valid ranges", () => {
  const a1 = {
    meta: { validRanges: ["1d", "5d", "1mo"] }
  } as unknown as EnrichedAsset;
  const a2 = {
    meta: { validRanges: ["5d", "1mo", "3mo"] }
  } as unknown as EnrichedAsset;
  expect(commonAssetRanges([a1, a2])).toEqual(["1d", "5d", "1mo", "3mo"]);
  expect(commonAssetRanges([a1, a2, a2])).toEqual(["1d", "5d", "1mo", "3mo"]);
  expect(commonAssetRanges([])).toEqual([]);
});

test("combineAssetCharts merges points, carrying forward last seen per asset", () => {
  const aapl = asset("aapl", [pt(1, 1, 1), pt(3, 3, 3), pt(5, 5, 5)]);
  const googl = asset("googl", [pt(2, 2, 2), pt(4, 4, 4), pt(6, 6, 6)]);
  const chart = combineAssetCharts([aapl, googl]);
  expect(chart.map((p) => p.timestamp)).toEqual(
    [1, 2, 3, 4, 5, 6].map((t) => t as UnixDate)
  );
  expect(chart.map((p) => p.price)).toEqual([3, 3, 5, 7, 9, 11]);
  expect(chart.map((p) => p.volume)).toEqual([3, 3, 5, 7, 9, 11]);
});

test("combineAssetCharts with a single asset returns its chart unchanged", () => {
  const aapl = asset("aapl", [pt(1, 10, 0), pt(2, 20, 0)]);
  const res = combineAssetCharts([aapl]);
  expect(res.map((p) => p.price)).toEqual([10, 20]);
});

test("combineAssetCharts with no assets returns a single fallback point", () => {
  const res = combineAssetCharts([]);
  expect(res.length).toBe(1);
  expect(res[0].price).toBe(0);
  expect(res[0].volume).toBe(0);
  expect(res[0].timestamp).toBeNumber();
});

test("enrichChart without txs keeps price per unit", () => {
  const res = enrichChart(chart([[100, 10]]), []);
  expect(res[0].price).toBe(10);
  expect(res[0].tx).toBeNull();
});

test("enrichChart multiplies by running holding and tags the current tx", () => {
  // earliest tx (150) is after the chart start (100) → a synthetic zero-holding
  // tx is prepended, so the first point shows zero units
  const res = enrichChart(
    chart([
      [100, 10],
      [150, 20],
      [200, 30],
      [250, 40]
    ]),
    [tx(150, 2), tx(250, 3)]
  );
  expect(res.map((p) => p.price)).toEqual([0, 40, 60, 120]);
  expect(res[0].tx).toBeNull(); // before the first tx
  expect(res[1].tx?.quantity).toBe(1); // tx at 150 tagged
  expect(res[2].tx).toBeNull();
  expect(res[3].tx?.quantity).toBe(1); // tx at 250 tagged
});

test("enrichChart chart starting before first tx shows zero units until it", () => {
  const res = enrichChart(
    chart([
      [100, 10],
      [200, 20],
      [300, 30]
    ]),
    [tx(300, 4, 2)]
  );
  expect(res.map((p) => p.price)).toEqual([0, 0, 120]);
  expect(res[0].tx).toBeNull();
  expect(res[2].tx?.quantity).toBe(2);
});

test("enrichChart fast-forwards txs that predate the chart", () => {
  const res = enrichChart(
    chart([
      [100, 10],
      [200, 20]
    ]),
    [tx(10, 5, 1), tx(50, 8, 1)]
  );
  // both txs predate the chart; the latest one's holding applies, no tx tagging
  expect(res.map((p) => p.price)).toEqual([80, 160]);
  expect(res[0].tx).toBeNull();
});

test("enrichChart tx exactly at the first chart point is tagged there", () => {
  const res = enrichChart(
    chart([
      [100, 10],
      [200, 20]
    ]),
    [tx(100, 2, 1)]
  );
  expect(res.map((p) => p.price)).toEqual([20, 40]);
  expect(res[0].tx?.quantity).toBe(1);
  expect(res[1].tx).toBeNull();
});

test("EARLIEST_TS constant is 0", () => {
  expect(EARLIEST_TS).toBe(0 as UnixDate);
});
