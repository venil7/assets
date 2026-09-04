import { expect, test } from "bun:test";
import * as E from "fp-ts/lib/Either";
import {
  alphaNumOnly,
  AppErrorType,
  length,
  match,
  noWhiteSpace,
  shortPassword,
  shortUsername,
  startsWithLetter
} from "../src";
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

test("match rule", () => {
  expect(E.isRight(match("a", "a")(E.right("x")))).toBe(true);
  const res = match("a", "b")(E.right("x"));
  expect(E.isLeft(res)).toBe(true);
  if (E.isLeft(res)) expect(res.left[0].message).toBe("Passwords do not match");
});

test("length rule", () => {
  expect(E.isRight(length(3)("abc")(E.right("x")))).toBe(true);
  expect(E.isLeft(length(3)("ab")(E.right("x")))).toBe(true);
});

test("startsWithLetter rule", () => {
  expect(E.isRight(startsWithLetter("abc")(E.right("x")))).toBe(true);
  expect(E.isLeft(startsWithLetter("1abc")(E.right("x")))).toBe(true);
});

test("alphaNumOnly rule", () => {
  expect(E.isRight(alphaNumOnly("abc1")(E.right("x")))).toBe(true);
  expect(E.isRight(alphaNumOnly("john_smith1")(E.right("x")))).toBe(true);
  expect(E.isRight(alphaNumOnly("john.smith1")(E.right("x")))).toBe(true);
  expect(E.isLeft(alphaNumOnly("abc!")(E.right("x")))).toBe(true);
});

test("noWhiteSpace rule", () => {
  expect(E.isRight(noWhiteSpace("abc")(E.right("x")))).toBe(true);
  expect(E.isLeft(noWhiteSpace("a b")(E.right("x")))).toBe(true);
});

test("shortUsername rejects short / non-alpha-start / non-alphanumeric names", () => {
  expect(E.isRight(shortUsername("abc123")(E.right("x")))).toBe(true);
  expect(E.isLeft(shortUsername("ab")(E.right("x")))).toBe(true);
  expect(E.isLeft(shortUsername("_bc")(E.right("x")))).toBe(true);
  expect(E.isLeft(shortUsername("abc!")(E.right("x")))).toBe(true);
  expect(E.isLeft(shortUsername("a b")(E.right("x")))).toBe(true);
});

test("shortPassword rejects short passwords", () => {
  expect(E.isRight(shortPassword("abcde")(E.right("x")))).toBe(true);
  expect(E.isLeft(shortPassword("abcd")(E.right("x")))).toBe(true);
});
