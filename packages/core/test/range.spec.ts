import { expect, test } from "bun:test";
import { addDays, addMonths, addSeconds, addYears } from "date-fns";
import type { ChartInterval, ChartRange, UnixDate } from "../src";
import {
  getToBase,
  intervalForRange,
  rangeForDate,
  tfForRange
} from "../src/domain/yahoo";
import { now } from "../src/utils/date";

test("rangeForDate: 10y", () => {
  const res = rangeForDate(addYears(now(), -11));
  expect(res).toBe("max");
});

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

test("rangeForDate: dates at/after today map to 1d", () => {
  const today = now();
  expect(rangeForDate(today)).toBe("1d");
  expect(rangeForDate(addDays(today, 1))).toBe("1d");
});

test("rangeForDate: recent past", () => {
  const today = now();
  expect(rangeForDate(addSeconds(today, -2))).toBe("1d");
  expect(rangeForDate(addDays(today, -2))).toBe("5d");
  expect(rangeForDate(addDays(today, -5))).toBe("5d");
});

test("rangeForDate: months ago", () => {
  const today = now();
  expect(rangeForDate(addDays(today, -6))).toBe("1mo");
  expect(rangeForDate(addMonths(today, -1))).toBe("1mo");
  expect(rangeForDate(addMonths(today, -2))).toBe("3mo");
  expect(rangeForDate(addMonths(today, -3))).toBe("3mo");
  expect(rangeForDate(addMonths(today, -4))).toBe("6mo");
  expect(rangeForDate(addMonths(today, -7))).toBe("1y");
});

test("rangeForDate: years ago", () => {
  const today = now();
  expect(rangeForDate(addYears(today, -1))).toBe("1y");
  expect(rangeForDate(addYears(today, -2))).toBe("2y");
  expect(rangeForDate(addYears(today, -3))).toBe("5y");
  expect(rangeForDate(addYears(today, -7))).toBe("10y");
  expect(rangeForDate(addYears(today, -11))).toBe("max");
  expect(rangeForDate(addYears(today, -20))).toBe("max");
});

test("rangeForDate: the single-second dead zone before now maps to max", () => {
  // between now-1s and now falls through every case to the default
  const today = now();
  expect(rangeForDate(addSeconds(today, -1))).toBe("max");
});

test("getToBase divides by the base rate", () => {
  expect(getToBase(2)(10)).toBe(5);
  expect(getToBase(1)(7)).toBe(7);
  expect(getToBase(0.5)(10)).toBe(20);
});
