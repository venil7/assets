import { expect, test } from "bun:test";
import * as A from "fp-ts/lib/ReadonlyArray";
import { itemsByPage, totalPages } from "../src/components/Pager/Pager";

test("total pages correct", () => {
  const items = A.makeBy(10, (i) => i);
  const tp3 = totalPages(items.length, 3);
  expect(tp3).toBe(4);
  const tp1 = totalPages(items.length, 1);
  expect(tp1).toBe(10);
  const tp4 = totalPages(items.length, 4);
  expect(tp4).toBe(3);
  const tp5 = totalPages(items.length, 5);
  expect(tp5).toBe(2);
});

test("items by page", () => {
  const items = A.makeBy(10, (i) => i);
  const items1 = itemsByPage(items as number[], 3, 0);
  expect(items1).toEqual([0, 1, 2]);
  const items2 = itemsByPage(items as number[], 3, 1);
  expect(items2).toEqual([3, 4, 5]);
  const items3 = itemsByPage(items as number[], 3, 2);
  expect(items3).toEqual([6, 7, 8]);
  const items4 = itemsByPage(items as number[], 3, 3);
  expect(items4).toEqual([9]);
});
