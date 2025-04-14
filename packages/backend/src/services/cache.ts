import { type Action } from "@darkruby/assets-core";
import { createLogger } from "@darkruby/fp-express";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { type LRUCache } from "lru-cache";
import { createHash } from "node:crypto";

export type Stringifiable = string | number | Buffer | boolean;
export type Cache = LRUCache<Stringifiable, any>;

const toKey = (...k: Stringifiable[]) =>
  createHash("md5").update(k.map(String).join("")).digest("hex");

const log = createLogger("cache");

const has = (cache: Cache) => (key: string) => cache.has(toKey(key));

const getter =
  (cache: Cache) =>
  <T>(key: string): O.Option<T> => {
    return pipe(
      O.tryCatch(() => cache.get(toKey(key))),
      O.filter((x) => x !== null && x !== undefined)
    );
  };

const setter =
  (cache: Cache) =>
  <T>(key: string, val: T, ttl?: number): O.Option<T> => {
    return pipe(
      O.of(val),
      O.chain(() => O.tryCatch(() => cache.set(toKey(key), val, { ttl }))),
      O.map(() => val)
    );
  };

const cachedAction =
  (cache: Cache) =>
  <T>(key: string, f: () => Action<T>, ttl?: number): Action<T> => {
    const get = getter(cache);
    const res = get(key);
    if (O.isSome(res)) {
      log.debug(`hit for ${key}`);
      return TE.of(res.value as T);
    }
    log.debug(`miss for ${key}`);
    const set = setter(cache);

    return pipe(
      f(),
      TE.tapIO((res) => () => set(key, res, ttl))
    );
  };

export type AppCache = ReturnType<typeof createCache>;

export const createCache = (cache: Cache) => {
  return {
    has: has(cache),
    getter: getter(cache),
    setter: setter(cache),
    cachedAction: cachedAction(cache),
  };
};
