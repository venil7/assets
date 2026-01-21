import { expect, test } from "bun:test";
import { pipe } from "fp-ts/lib/function";
import type { NonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import { fuzzyIndexSearch } from "../src/utils/array";

const array = [0, 2, 5, 9, 11, 12].toSorted(
  (a, b) => a - b
) as NonEmptyArray<number>;

const expected = [
  [-1, 0],
  [0, 0],
  [1, 0],
  [2, 2],
  [3, 2],
  [4, 5],
  [5, 5],
  [6, 5],
  [7, 5],
  [8, 9],
  [9, 9],
  [10, 9],
  [11, 11],
  [12, 12],
  [13, 12]
];

expected.forEach(([needle, found]) =>
  test(`fuzzy search: looking for ${needle} should find ${found}`, () => {
    const idx = pipe(
      array,
      fuzzyIndexSearch<number>(needle, (i) => i)
    );
    expect(array[idx]).toBe(found);
  })
);
