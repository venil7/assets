import { expect, test } from "bun:test";
import { identity, pipe } from "fp-ts/lib/function";
import { epoch, maxTs, minTs, unixNow, type UnixDate } from "../src";

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
