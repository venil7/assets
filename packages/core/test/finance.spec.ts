import { expect, test } from "bun:test";
import { identity, pipe } from "fp-ts/lib/function";
import { calcPnl, invested, pctOf, sum, volatility } from "../src";

test("calc pnl", () => {
  const [val, pct] = calcPnl({ before: 100, after: 120 });
  expect(val).toBe(20);
  expect(pct).toBe(0.2);
});

test("calc invested (reverse PNL)", () => {
  const orig = invested({ returnValue: 20, returnPct: 0.2 });
  expect(orig).toBe(100);
});

test("volatility", () => {
  const [v, pct] = volatility(80, 120);
  expect(v).toBe(40);
  expect(pct).toBe(0.4);
});

test("percent of", () => {
  const pct = pctOf(80, 120);
  expect(pct).toBe(1.5);
});

test("sum", () => {
  const as = [1, 2, 3];
  const res = pipe(as, sum(identity));
  expect(res).toBe(6);
});

test("sum (empty)", () => {
  const as = <number[]>[];
  const res = pipe(as, sum(identity));
  expect(res).toBe(0);
});
