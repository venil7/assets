import { expect, test } from "bun:test";
import * as E from "fp-ts/lib/Either";
import {
  ccyFromUrl,
  dateFromUrl,
  numberFromUrl,
  optDateFromUrl,
  rangeFromUrl
} from "../src/decoders/params";

test("numberFromUrl parses numeric strings", async () => {
  const ok = await numberFromUrl("123")();
  expect(E.isRight(ok)).toBe(true);
  if (E.isRight(ok)) expect(ok.right).toBe(123);
  const bad = await numberFromUrl("abc")();
  expect(E.isLeft(bad)).toBe(true);
});

test("rangeFromUrl parses valid ranges and falls back to 1d", async () => {
  const ok = await rangeFromUrl("1mo")();
  expect(E.isRight(ok)).toBe(true);
  if (E.isRight(ok)) expect(ok.right).toBe("1mo");
  const fallback = await rangeFromUrl("bogus")();
  expect(E.isRight(fallback)).toBe(true);
  if (E.isRight(fallback)) expect(fallback.right).toBe("1d");
});

test("ccyFromUrl", async () => {
  const ok = await ccyFromUrl("USD")();
  expect(E.isRight(ok)).toBe(true);
  if (E.isRight(ok)) expect(ok.right).toBe("USD");
  const bad = await ccyFromUrl("XXX")();
  expect(E.isLeft(bad)).toBe(true);
});

test("dateFromUrl parses ISO dates and rejects garbage", async () => {
  const ok = await dateFromUrl("2023-10-15")();
  expect(E.isRight(ok)).toBe(true);
  if (E.isRight(ok)) expect(ok.right).toBeInstanceOf(Date);
  const bad = await dateFromUrl("nope")();
  expect(E.isLeft(bad)).toBe(true);
});

test("optDateFromUrl accepts undefined and valid dates, falls back on garbage", async () => {
  const none = await optDateFromUrl(undefined)();
  expect(E.isRight(none)).toBe(true);
  if (E.isRight(none)) expect(none.right).toBeUndefined();
  const some = await optDateFromUrl("2023-10-15")();
  expect(E.isRight(some)).toBe(true);
  if (E.isRight(some)) expect(some.right).toBeInstanceOf(Date);
  // withFallback swallows invalid input and falls back to undefined
  const bad = await optDateFromUrl("nope")();
  expect(E.isRight(bad)).toBe(true);
  if (E.isRight(bad)) expect(bad.right).toBeUndefined();
});
