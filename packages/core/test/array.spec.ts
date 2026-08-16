import { expect, test } from "bun:test";
import type { NonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import { nonEmpty, onEmpty } from "../src/utils/array";

test("nonEmpty", () => {
  expect(nonEmpty([])).toBe(false);
  expect(nonEmpty([1])).toBe(true);
  expect(nonEmpty(["a", "b"])).toBe(true);
});

test("onEmpty returns fallback when empty, invoking it only once", () => {
  let calls = 0;
  const fallback = () => {
    calls += 1;
    return 42;
  };
  const res = onEmpty(fallback)([]);
  expect(res).toEqual([42]);
  expect(calls).toBe(1);
});

test("onEmpty returns the same non-empty array untouched", () => {
  const as: NonEmptyArray<number> = [1, 2, 3];
  const res = onEmpty(() => 42)(as);
  expect(res).toBe(as);
  expect(res).toEqual([1, 2, 3]);
});
