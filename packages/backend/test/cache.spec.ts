import { expect, test } from "bun:test";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { createCache } from "../src/services/cache";

test("setter / getter / has roundtrip", () => {
  const cache = createCache(10, 1000);
  expect(cache.has("k")).toBe(false);
  cache.setter("k", 42);
  expect(cache.has("k")).toBe(true);
  const got = cache.getter("k");
  expect(O.isSome(got)).toBe(true);
  if (O.isSome(got)) expect(got.value).toBe(42);
});

test("cachedAction caches the result; a hit does not re-execute the action", async () => {
  const cache = createCache(10, 1000);
  let calls = 0;
  const action = () => {
    calls += 1;
    return TE.of("ok");
  };
  // construct a fresh cachedAction per call (as production code does)
  const r1 = await cache.cachedAction("key", action, 1000)();
  const r2 = await cache.cachedAction("key", action, 1000)();
  expect(r1).toEqual(E.right("ok"));
  expect(r2).toEqual(E.right("ok"));
  expect(calls).toBe(1);
});

test("cachedAction re-executes after TTL expiry", async () => {
  const cache = createCache(10, 1000);
  let calls = 0;
  const action = () => {
    calls += 1;
    return TE.of("v");
  };
  await cache.cachedAction("k", action, 30)();
  await cache.cachedAction("k", action, 30)();
  expect(calls).toBe(1);
  await new Promise((r) => setTimeout(r, 60));
  const r = await cache.cachedAction("k", action, 30)();
  expect(calls).toBe(2);
  expect(r).toEqual(E.right("v"));
});

test("cache evicts least-recently-used entries at max size", () => {
  const cache = createCache(2, 10000);
  cache.setter("a", 1);
  cache.setter("b", 2);
  cache.setter("c", 3);
  expect(cache.has("a")).toBe(false);
  expect(cache.has("b")).toBe(true);
  expect(cache.has("c")).toBe(true);
});

test("cachedAction does not share keys across distinct keys", async () => {
  const cache = createCache(10, 1000);
  let calls = 0;
  const action = () => {
    calls += 1;
    return TE.of("x");
  };
  await cache.cachedAction("one", action, 1000)();
  await cache.cachedAction("two", action, 1000)();
  expect(calls).toBe(2);
});
