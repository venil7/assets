import type {
  ChartDataPoint,
  EnrichedAsset,
  UnixDate
} from "@darkruby/assets-core";
import { expect, test } from "bun:test";
import { portfolioMultiChart } from "../src/enrichment/chart";

const createMockChartPoint = (
  timestamp: number,
  price: number,
  volume: number = 0
): ChartDataPoint => ({
  timestamp: timestamp as UnixDate,
  price,
  volume,
  tx: null
});

const createMockAsset = (name: string, ts: number[]): EnrichedAsset => {
  return {
    name,
    base: { chart: ts.map((t) => createMockChartPoint(t, t)) }
  } as unknown as EnrichedAsset;
};

test.failing("portfolioMultiChart with asset containers", () => {
  const assets = [
    createMockAsset("aapl", [1, 3, 5]),
    createMockAsset("googl", [2, 4, 6]),
    createMockAsset("msft", [1, 4, 5])
  ] as EnrichedAsset[];

  const { aapl, googl, msft } = portfolioMultiChart(assets);

  expect(aapl.length).toBe(googl.length);
  expect(googl.length).toBe(msft.length);

  // Verify same timestamps across all assets
  aapl.forEach((point, i) => {
    expect(point.timestamp).toBe(googl[i].timestamp);
    expect(googl[i].timestamp).toBe(msft[i].timestamp);
  });

  expect(aapl.map((t) => t.price)).toEqual([1, 1, 3, 3, 5, 5]);
  expect(googl.map((t) => t.price)).toEqual([2, 2, 2, 4, 4, 6]);
  expect(msft.map((t) => t.price)).toEqual([1, 1, 1, 4, 5, 5]);
});
