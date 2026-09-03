import { AppErrorType } from "@darkruby/assets-core";
import {
  dateDecoder,
  nonFuture,
  UnixDateDecoder
} from "@darkruby/assets-core/src/decoders/date";
import {
  nonNegative,
  NumberDecoder
} from "@darkruby/assets-core/src/decoders/number";
import { nonEmptyString } from "@darkruby/assets-core/src/decoders/string";
import {
  liftE,
  liftTE,
  nullableDecoder
} from "@darkruby/assets-core/src/decoders/util";
import { expect, test } from "bun:test";
import * as E from "fp-ts/lib/Either";

test("dateDecoder accepts ISO string", () => {
  const res = dateDecoder.decode("2023-10-15T00:00:00.000Z");
  expect(E.isRight(res)).toBe(true);
  if (E.isRight(res)) {
    expect(res.right.getTime()).toBe(Date.parse("2023-10-15T00:00:00.000Z"));
  }
});

test("dateDecoder accepts unix seconds number", () => {
  const res = dateDecoder.decode(1697328000);
  expect(E.isRight(res)).toBe(true);
  if (E.isRight(res)) expect(res.right.getTime()).toBe(1697328000 * 1000);
});

test("dateDecoder accepts a Date instance", () => {
  const d = new Date();
  expect(E.isRight(dateDecoder.decode(d))).toBe(true);
});

test("dateDecoder rejects garbage", () => {
  expect(E.isLeft(dateDecoder.decode("not-a-date"))).toBe(true);
  expect(E.isLeft(dateDecoder.decode(undefined))).toBe(true);
});

test("nonFuture accepts today, rejects tomorrow", () => {
  expect(E.isRight(nonFuture.decode(new Date()))).toBe(true);
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const res = nonFuture.decode(tomorrow);
  expect(E.isLeft(res)).toBe(true);
  if (E.isLeft(res)) expect(res.left[0].message).toBe("Can't be future date");
});

test("UnixDateDecoder brand", () => {
  expect(E.isRight(UnixDateDecoder.decode(0))).toBe(true);
  expect(E.isRight(UnixDateDecoder.decode(123))).toBe(true);
  expect(E.isLeft(UnixDateDecoder.decode(-1))).toBe(true);
  expect(E.isLeft(UnixDateDecoder.decode(1.5))).toBe(true);
  expect(E.isRight(UnixDateDecoder.decode("123"))).toBe(true); // numeric strings accepted via NumberDecoder
  expect(E.isLeft(UnixDateDecoder.decode("abc"))).toBe(true);
});

test("NumberDecoder accepts number and numeric string", () => {
  expect(E.isRight(NumberDecoder.decode(12))).toBe(true);
  expect(E.isRight(NumberDecoder.decode("12"))).toBe(true);
  expect(E.isLeft(NumberDecoder.decode("abc"))).toBe(true);
});

test("nonNegative rejects zero and negative", () => {
  expect(E.isLeft(nonNegative.decode(0))).toBe(true);
  expect(E.isLeft(nonNegative.decode(-5))).toBe(true);
  expect(E.isRight(nonNegative.decode(5))).toBe(true);
  expect(E.isRight(nonNegative.decode("5"))).toBe(true);
});

test("nonEmptyString rejects empty, accepts whitespace and text", () => {
  expect(E.isLeft(nonEmptyString.decode(""))).toBe(true);
  expect(E.isRight(nonEmptyString.decode("   "))).toBe(true); // io-ts-types NonEmptyString only checks length
  expect(E.isRight(nonEmptyString.decode("abc"))).toBe(true);
});

test("liftE maps decode failure to AppError", () => {
  const res = liftE(NumberDecoder)("nope");
  expect(E.isLeft(res)).toBe(true);
  if (E.isLeft(res)) {
    expect(res.left.type).toBe(AppErrorType.Validation);
    expect(res.left.message).toBeString();
  }
});

test("liftE passes decoded value through", () => {
  const res = liftE(NumberDecoder)("12");
  expect(E.isRight(res)).toBe(true);
  if (E.isRight(res)) expect(res.right).toBe(12);
});

test("liftTE returns a TaskEither", async () => {
  const ok = await liftTE(NumberDecoder)("12")();
  expect(E.isRight(ok)).toBe(true);
  const bad = await liftTE(NumberDecoder)("nope")();
  expect(E.isLeft(bad)).toBe(true);
});

test("nullableDecoder accepts null and undefined", () => {
  const d = nullableDecoder(NumberDecoder);
  expect(E.isRight(d.decode(null))).toBe(true);
  expect(E.isRight(d.decode(undefined))).toBe(true);
  expect(E.isRight(d.decode(5))).toBe(true);
});
