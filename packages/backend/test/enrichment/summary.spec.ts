import type { EnrichedPortfolio, UnixDate } from "@darkruby/assets-core";
import { expect, test } from "bun:test";
import { enrichSummary } from "../../src/enrichment/summary";

const portfolio = (): EnrichedPortfolio =>
  ({
    id: 1,
    name: "p1",
    invested: 1000,
    fxImpact: 0,
    realizedPnl: 80,
    breakEven: 1000,
    meta: {
      range: "1d",
      validRanges: ["1d", "5d"],
      fiftyTwoWeekLow: 10,
      fiftyTwoWeekHigh: 20,
      currencies: ["USD"],
      exchanges: ["NMS"],
      types: ["EQUITY"]
    },
    changes: {
      startPrice: 100,
      endPrice: 120,
      startTs: 1000 as UnixDate,
      endTs: 2000 as UnixDate,
      returnValue: 20,
      returnPct: 0.2
    },
    totals: { returnValue: 30, returnPct: 0.3 },
    chart: [{ timestamp: 1000 as UnixDate, price: 100, volume: 0, tx: null }]
  }) as unknown as EnrichedPortfolio;

test("enrichSummary with no portfolios is zeroed", () => {
  const s = enrichSummary([]);
  expect(s.numPortfolios).toBe(0);
  expect(s.invested).toBe(0);
  expect(s.realizedPnl).toBe(0);
  expect(s.fxImpact).toBe(0);
  expect(s.breakEven).toBe(0);
  expect(s.totals).toEqual({ returnValue: 0, returnPct: 0 });
  expect(s.changes.returnValue).toBe(0);
  expect(s.changes.returnPct).toBe(0);
  expect(s.changes.startPrice).toBe(0);
  expect(s.changes.startTs).toBe(0 as UnixDate);
  expect(s.changes.endTs).toBeNumber();
  expect(s.meta.range).toBe("1d");
  expect(s.meta.validRanges).toEqual([]);
  expect(s.meta.fiftyTwoWeekLow).toBe(0);
  expect(s.meta.fiftyTwoWeekHigh).toBe(0);
  expect(s.meta.currencies).toEqual([]);
  expect(s.meta.exchanges).toEqual([]);
  expect(s.meta.types).toEqual([]);
  expect(s.meta.volatilityRange).toBe(0);
  expect(s.meta.volatilityPct).toBe(0);
  expect(s.chart.length).toBeGreaterThan(0);
});

test("enrichSummary aggregates a single portfolio", () => {
  const s = enrichSummary([portfolio()]);
  expect(s.numPortfolios).toBe(1);
  expect(s.invested).toBe(1000);
  expect(s.realizedPnl).toBe(80);
  expect(s.fxImpact).toBe(0);
  expect(s.breakEven).toBe(1000);
  // meta
  expect(s.meta.currencies).toEqual(["USD"]);
  expect(s.meta.exchanges).toEqual(["NMS"]);
  expect(s.meta.types).toEqual(["EQUITY"]);
  expect(s.meta.validRanges).toEqual(["1d", "5d"]);
  expect(s.meta.range).toBe("1d");
  // changes
  expect(s.changes.startPrice).toBe(100);
  expect(s.changes.endPrice).toBe(120);
  expect(s.changes.startTs).toBe(1000 as UnixDate);
  expect(s.changes.endTs).toBe(2000 as UnixDate);
  // totals: invested 30/0.3 = 100; returnValue 30; pct = 30/100
  expect(s.totals.returnValue).toBe(30);
  expect(s.totals.returnPct).toBeCloseTo(0.3);
  // chart & multiChart
  expect(s.chart.length).toBeGreaterThan(0);
  expect(Object.keys(s.multiChart)).toEqual(["p1"]);
  expect(s.multiChart["p1"].length).toBeGreaterThan(0);
});

test("enrichSummary aggregates multiple portfolios", () => {
  const p1 = portfolio();
  const p2: EnrichedPortfolio = {
    ...p1,
    name: "p2",
    invested: 500,
    realizedPnl: 20,
    breakEven: 500,
    meta: {
      ...p1.meta,
      fiftyTwoWeekLow: 5,
      fiftyTwoWeekHigh: 15,
      currencies: ["USD", "EUR"]
    },
    changes: {
      ...p1.changes,
      startPrice: 50,
      endPrice: 60,
      startTs: 500 as UnixDate,
      returnValue: 10,
      returnPct: 0.2
    },
    totals: { returnValue: 10, returnPct: 0.2 },
    chart: [{ timestamp: 500 as UnixDate, price: 50, volume: 0, tx: null }]
  } as unknown as EnrichedPortfolio;

  const s = enrichSummary([p1, p2]);
  expect(s.numPortfolios).toBe(2);
  expect(s.invested).toBe(1500);
  expect(s.realizedPnl).toBe(100);
  expect(s.breakEven).toBe(1500);
  expect(s.meta.currencies).toEqual(["USD", "EUR"]);
  expect(s.changes.startPrice).toBe(150);
  expect(s.changes.endPrice).toBe(180);
  expect(s.changes.startTs).toBe(500 as UnixDate);
  expect(s.changes.endTs).toBe(2000 as UnixDate);
  // totals: p1 invested 100, p2 invested 10/0.2 = 50 → total 150; returnValue 40; pct 40/150
  expect(s.totals.returnValue).toBe(40);
  expect(s.totals.returnPct).toBeCloseTo(40 / 150);
  expect(Object.keys(s.multiChart)).toEqual(["p1", "p2"]);
});

test("summaryMeta sums fiftyTwoWeekLow/High correctly (currently swapped in enrichment/summary.ts)", () => {
  const s = enrichSummary([portfolio()]);
  expect(s.meta.fiftyTwoWeekLow).toBe(10);
  expect(s.meta.fiftyTwoWeekHigh).toBe(20);
});
