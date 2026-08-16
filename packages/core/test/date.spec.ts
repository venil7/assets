import { expect, test } from "bun:test";
import { identity, pipe } from "fp-ts/lib/function";
import { epoch, maxTs, minTs, unixNow, type UnixDate } from "../src";
import { DateOrd, LatestDateMonoid, unixTimestamp } from "../src/utils/date";

test("minTs (non empty)", () => {
  const as = <UnixDate[]>[123, 124, 125];
  const res = pipe(as, minTs(identity));
  expect(res).toBe(123 as UnixDate);
});

test("maxTs (non empty)", () => {
  const as = <UnixDate[]>[123, 124, 125];
  const res = pipe(as, maxTs(identity));
  expect(res).toBe(125 as UnixDate);
});

test("minTs (empty)", () => {
  const as = <UnixDate[]>[];
  const res = pipe(as, minTs(identity));
  expect(res).toBe(epoch());
});

test("maxTs (empty)", () => {
  const as = <UnixDate[]>[];
  const res = pipe(as, maxTs(identity));
  expect(res).toBe(unixNow());
});

test("unixTimestamp floors absolute value", () => {
  expect(unixTimestamp(5.7)).toBe(5 as UnixDate);
  expect(unixTimestamp(-5.7)).toBe(5 as UnixDate);
  expect(unixTimestamp(0)).toBe(0 as UnixDate);
});

test("epoch is 0", () => {
  expect(epoch()).toBe(0 as UnixDate);
});

test("LatestDateMonoid concat picks the max date", () => {
  expect(
    LatestDateMonoid.concat(new Date(1000), new Date(2000)).getTime()
  ).toBe(2000);
  expect(
    LatestDateMonoid.concat(new Date(2000), new Date(1000)).getTime()
  ).toBe(2000);
});

test("LatestDateMonoid empty is epoch", () => {
  expect(LatestDateMonoid.empty.getTime()).toBe(0);
});

test("DateOrd compare", () => {
  expect(DateOrd.compare(new Date(1000), new Date(2000))).toBe(-1);
  expect(DateOrd.compare(new Date(2000), new Date(1000))).toBe(1);
  expect(DateOrd.compare(new Date(1000), new Date(1000))).toBe(0);
});

test("DateOrd equals", () => {
  expect(DateOrd.equals(new Date(1000), new Date(1000))).toBe(true);
  expect(DateOrd.equals(new Date(1000), new Date(1001))).toBe(false);
});
