import { expect, test } from "bun:test";
import * as E from "fp-ts/lib/Either";
import { AppErrorType } from "../src";
import { maybe } from "../src/utils/func";
import { defined, tryAsync, trySync } from "../src/utils/utils";

test("defined", () => {
  expect(defined(null)).toBe(false);
  expect(defined(undefined)).toBe(false);
  expect(defined(0)).toBe(true);
  expect(defined("")).toBe(true);
  expect(defined(false)).toBe(true);
  expect(defined({})).toBe(true);
});

test("maybe maps a defined value", () => {
  const double = maybe((x: number) => x * 2);
  expect(double(2)).toBe(4);
});

test("maybe returns undefined for nullish input", () => {
  const double = maybe((x: number) => x * 2);
  expect(double(null)).toBeUndefined();
  expect(double(undefined)).toBeUndefined();
});

test("trySync returns Right on success", async () => {
  const res = await trySync(() => 42)();
  expect(E.isRight(res)).toBe(true);
  if (E.isRight(res)) expect(res.right).toBe(42);
});

test("trySync maps thrown error to Left", async () => {
  const res = await trySync(() => {
    throw new Error("boom");
  })();
  expect(E.isLeft(res)).toBe(true);
  if (E.isLeft(res)) {
    expect(res.left.type).toBe(AppErrorType.General);
    expect(res.left.message).toContain("boom");
  }
});

test("tryAsync returns Right on resolved promise", async () => {
  const res = await tryAsync(async () => 7)();
  expect(E.isRight(res)).toBe(true);
});

test("tryAsync maps rejected promise to Left", async () => {
  const res = await tryAsync(async () => {
    throw new Error("nope");
  })();
  expect(E.isLeft(res)).toBe(true);
  if (E.isLeft(res)) expect(res.left.message).toContain("nope");
});
