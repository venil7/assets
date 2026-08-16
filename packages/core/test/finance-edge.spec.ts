import { expect, test } from "bun:test";
import {
  avg,
  calcCumulativePnl,
  calcPnl,
  invested,
  pctOf,
  unique,
  uniques,
  volatility,
  type Totals
} from "../src";

test("calcPnl with zero before returns pct 0 (not Infinity)", () => {
  const [val, pct] = calcPnl({ before: 0, after: 10 });
  expect(val).toBe(10);
  expect(pct).toBe(0);
});

test("volatility(0, 0) is [0, 0] (no division by zero)", () => {
  const [v, pct] = volatility(0, 0);
  expect(v).toBe(0);
  expect(pct).toBe(0);
});

test("volatility is symmetric (abs)", () => {
  const [v1] = volatility(80, 120);
  const [v2] = volatility(120, 80);
  expect(v1).toBe(v2);
  expect(v1).toBe(40);
});

test("invested with zero returnPct falls back to returnValue", () => {
  expect(invested({ returnValue: 20, returnPct: 0 })).toBe(20);
});

test("pctOf with zero whole is 0", () => {
  expect(pctOf(0, 5)).toBe(0);
  expect(pctOf(80, 120)).toBe(1.5);
});

test("calcCumulativePnl of empty list is [0, 0]", () => {
  expect(calcCumulativePnl((t: Totals) => t)([])).toEqual([0, 0]);
});

test("calcCumulativePnl aggregates value and weighted pct", () => {
  const totals: Totals[] = [
    { returnValue: 10, returnPct: 0.1 },
    { returnValue: 20, returnPct: 0.2 }
  ];
  // invested = 10/0.1 + 20/0.2 = 100 + 100 = 200; returnValue = 30; pct = 30/200
  expect(calcCumulativePnl((t: Totals) => t)(totals)).toEqual([30, 0.15]);
});

test("calcCumulativePnl with no invested is [0, 0]", () => {
  const totals: Totals[] = [{ returnValue: 0, returnPct: 0 }];
  expect(calcCumulativePnl((t: Totals) => t)(totals)).toEqual([0, 0]);
});

test("calcCumulativePnl with zero pct but positive value", () => {
  const totals: Totals[] = [{ returnValue: 50, returnPct: 0 }];
  // invested = returnValue = 50; pct = 50/50 = 1
  expect(calcCumulativePnl((t: Totals) => t)(totals)).toEqual([50, 1]);
});

test("unique dedupes by key, preserving first-seen order", () => {
  expect(
    unique((x: { id: number }) => x.id)([{ id: 1 }, { id: 1 }, { id: 2 }])
  ).toEqual([1, 2]);
});

test("uniques flattens and dedupes", () => {
  expect(
    uniques((x: { ids: number[] }) => x.ids)([{ ids: [1, 2] }, { ids: [2, 3] }])
  ).toEqual([1, 2, 3]);
});

test("avg", () => {
  expect(avg((x: number) => x)([1, 2, 3])).toBe(2);
  expect(avg((x: number) => x)([5])).toBe(5);
});

test("avg of empty list is NaN", () => {
  expect(avg((x: number) => x)([])).toBeNaN();
});
