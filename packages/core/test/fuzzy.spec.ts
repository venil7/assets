import { expect, test } from "bun:test";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import type { NonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import { fuzzyIndexSearch, fuzzyItemSearch } from "../src/utils/array";

const array = [0, 2, 5, 9, 11, 12].toSorted(
  (a, b) => a - b
) as NonEmptyArray<number>;

const needles = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

test(`fuzzy search idx (closest)`, () => {
  const indices = [0, 0, 0, 1, 1, 2, 2, 2, 2, 3, 3, 3, 4, 5, 5];
  const expected = pipe(needles, A.zip(indices));
  expected.forEach(([needle, index]) => {
    const fuzzyFindClosestIndex = fuzzyIndexSearch<number>((i) => i, "closest");
    const idx = pipe(array, fuzzyFindClosestIndex(needle));
    expect(
      idx,
      `for needle ${needle} should return index ${index}, but returned ${idx}`
    ).toBe(index);
  });
});

test(`fuzzy search idx (left)`, () => {
  const indices = [0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 3, 3, 4, 5, 5];
  const expected = pipe(needles, A.zip(indices));
  expected.forEach(([needle, index]) => {
    const fuzzyFindLeftIndex = fuzzyIndexSearch<number>((i) => i, "left");
    const idx = pipe(array, fuzzyFindLeftIndex(needle));
    expect(
      idx,
      `for needle ${needle} should return index ${index}, but returned ${idx}`
    ).toBe(index);
  });
});

test(`fuzzy search idx (left-unsafe)`, () => {
  const indices = [-1, 0, 0, 1, 1, 1, 2, 2, 2, 2, 3, 3, 4, 5, 5];
  const expected = pipe(needles, A.zip(indices));
  expected.forEach(([needle, index]) => {
    const fuzzyFindLeftUnsafeIndex = fuzzyIndexSearch<number>(
      (i) => i,
      "left-unsafe"
    );
    const idx = pipe(array, fuzzyFindLeftUnsafeIndex(needle));
    expect(
      idx,
      `for needle ${needle} should return index ${index}, but returned ${idx}`
    ).toBe(index);
  });
});

test(`fuzzy search idx (right): `, () => {
  const indices = [0, 0, 1, 1, 2, 2, 2, 3, 3, 3, 3, 4, 4, 5, 5];
  const expected = pipe(needles, A.zip(indices));
  expected.forEach(([needle, index]) => {
    const fuzzyFindRightIndex = fuzzyIndexSearch<number>((i) => i, "right");
    const idx = pipe(array, fuzzyFindRightIndex(needle));
    expect(
      idx,
      `for needle ${needle} should return index ${index}, but returned ${idx}`
    ).toBe(index);
  });
});

test(`fuzzy search idx (right-unsafe): `, () => {
  const indices = [0, 0, 1, 1, 2, 2, 2, 3, 3, 3, 3, 4, 4, 5, 6];
  const expected = pipe(needles, A.zip(indices));
  expected.forEach(([needle, index]) => {
    const fuzzyFindRightUnsafeIndex = fuzzyIndexSearch<number>(
      (i) => i,
      "right-unsafe"
    );
    const idx = pipe(array, fuzzyFindRightUnsafeIndex(needle));
    expect(
      idx,
      `for needle ${needle} should return index ${index}, but returned ${idx}`
    ).toBe(index);
  });
});

test(`fuzzy search item (closest): `, () => {
  const findItem = fuzzyItemSearch<number>((x) => x);
  const haystack = [1, 3, 5, 7, 9, 11] as NonEmptyArray<number>;
  const res = pipe(haystack, findItem(5.5));
  expect(res).toBe(5);
});
