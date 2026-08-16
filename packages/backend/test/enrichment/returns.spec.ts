import type {
  ChartData,
  FxRates,
  GetAsset,
  UnixDate,
  YahooChartData
} from "@darkruby/assets-core";
import { expect, test } from "bun:test";
import {
  $enrichedAssetBase,
  $enrichedAssetCcy,
  txsWithRates
} from "../../src/enrichment/returns";

const fxRates = {
  ccy: "USD",
  base: "USD",
  rates: [{ timestamp: 1000 as UnixDate, rate: 1 }],
  latest: { timestamp: 2000 as UnixDate, rate: 1 }
} as unknown as FxRates;

const chartData = [
  { timestamp: 1000 as UnixDate, price: 100, volume: 0, tx: null }
] as unknown as ChartData;

const chart = {
  chart: chartData,
  periodChanges: {
    startTs: 1000,
    endTs: 2000,
    startPrice: 90,
    endPrice: 100,
    returnValue: 10,
    returnPct: 0.1
  },
  meta: { currency: "USD", regularMarketPrice: 100 }
} as unknown as YahooChartData;

const asset = {
  invested: 0,
  holdings: 0,
  base_ccy: "USD",
  avg_price: 0,
  break_even: 0,
  realized_pnl: 0
} as unknown as GetAsset;

// frame produced the same way the enricher does (joinAsof adds rate columns
// even with zero rows, which the raw schema does not have)
const $emptyTxs = txsWithRates([], fxRates);

test("$enrichedAssetCcy with no active investment returns default totals", () => {
  const ccy = $enrichedAssetCcy(asset, chart, $emptyTxs);
  expect(ccy.totals).toEqual({ returnValue: 0, returnPct: 0 });
  expect(ccy.chart).toBe(chart.chart);
  expect(ccy.changes).toBe(chart.periodChanges);
});

test("$enrichedAssetBase with no active investment returns a zeroed base", () => {
  const base = $enrichedAssetBase(
    asset,
    chart,
    $emptyTxs,
    {
      chart: chartData,
      changes: chart.periodChanges,
      totals: { returnValue: 0, returnPct: 0 }
    },
    fxRates
  );
  expect(base.domestic).toBe(true);
  expect(base.invested).toBe(0);
  expect(base.avgPrice).toBeNull();
  expect(base.breakEven).toBe(0);
  expect(base.fxImpact).toBe(0);
  expect(base.realizedPnl).toBe(0);
  expect(base.totals).toEqual({ returnValue: 0, returnPct: 0 });
  expect(base.chart.length).toBeGreaterThan(0);
  // period changes pass through the fx conversion (rate 1 → unchanged)
  expect(base.changes.startPrice).toBe(90);
  expect(base.changes.endPrice).toBe(100);
});

test("$enrichedAssetCcy with a foreign base currency flags non-domestic", () => {
  const foreignAsset = { ...asset, base_ccy: "GBP" } as unknown as GetAsset;
  const ccy = $enrichedAssetCcy(foreignAsset, chart, $emptyTxs);
  expect(ccy.totals).toEqual({ returnValue: 0, returnPct: 0 });
});
