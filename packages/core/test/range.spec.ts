import { expect, test } from "bun:test";
import type { ChartInterval, ChartRange, UnixDate } from "../src";
import { getToBase, intervalForRange, tfForRange } from "../src/domain/yahoo";

test("intervalForRange maps every range", () => {
  const expected: Record<ChartRange, string> = {
    "1d": "5m",
    "5d": "15m",
    "1mo": "1h",
    "3mo": "1d",
    "6mo": "1d",
    "1y": "1d",
    "2y": "1d",
    "5y": "1d",
    "10y": "1mo",
    ytd: "1d",
    max: "1mo"
  };
  (Object.keys(expected) as ChartRange[]).forEach((r) => {
    expect(intervalForRange(r), `intervalForRange(${r})`).toBe(
      expected[r] as ChartInterval
    );
  });
});

test("tfForRange includes time of day only for intraday ranges", () => {
  const ts = 1_700_000_000 as UnixDate;
  (["1d", "5d", "1mo"] as ChartRange[]).forEach((r) => {
    const formatted = tfForRange(r)(ts);
    expect(formatted).toMatch(/:/);
  });
  (
    ["3mo", "6mo", "1y", "2y", "5y", "10y", "ytd", "max"] as ChartRange[]
  ).forEach((r) => {
    const formatted = tfForRange(r)(ts);
    expect(formatted).not.toMatch(/:/);
  });
});

test("tfForRange always returns a non-empty string", () => {
  const ts = 1_700_000_000 as UnixDate;
  (
    [
      "1d",
      "5d",
      "1mo",
      "3mo",
      "6mo",
      "1y",
      "2y",
      "5y",
      "10y",
      "ytd",
      "max"
    ] as ChartRange[]
  ).forEach((r) => {
    const out = tfForRange(r)(ts);
    expect(typeof out).toBe("string");
    expect(out.length).toBeGreaterThan(0);
  });
});

test("getToBase divides by the base rate", () => {
  expect(getToBase(2)(10)).toBe(5);
  expect(getToBase(1)(7)).toBe(7);
  expect(getToBase(0.5)(10)).toBe(20);
});
