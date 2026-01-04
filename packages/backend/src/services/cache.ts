import { type Action } from "@darkruby/assets-core";
import { createLogger } from "@darkruby/fp-express";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { type LRUCache } from "lru-cache";
import { createHash } from "node:crypto";

export type Stringifiable = string | number | Buffer | boolean;
export type Cache = LRUCache<Stringifiable, any>;

// Cache metrics for monitoring and observability
export type CacheMetrics = {
  hits: number;
  misses: number;
  total: number;
  hitRate: () => string; // Returns percentage as string "75.5%"
  reset: () => void;
};

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

export type AppCache = ReturnType<typeof createCache>;

export const createCache = (cache: Cache) => {
  // Metrics tracking
  let metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    total: 0,
    hitRate: function () {
      if (this.total === 0) return "N/A";
      return ((this.hits / this.total) * 100).toFixed(1) + "%";
    },
    reset: function () {
      this.hits = 0;
      this.misses = 0;
      this.total = 0;
    },
  };

  const cachedAction =
    <T>(key: string, f: () => Action<T>, ttl?: number): Action<T> => {
      const get = getter(cache);
      const res = get(key);

      if (O.isSome(res)) {
        metrics.hits++;
        metrics.total++;
        log.debug(`cache hit for ${key} (hit rate: ${metrics.hitRate()})`);
        return TE.of(res.value as T);
      }

      metrics.misses++;
      metrics.total++;
      log.debug(`cache miss for ${key} (hit rate: ${metrics.hitRate()})`);
      const set = setter(cache);

      return pipe(
        f(),
        TE.tapIO((res) => () =>
          set(key, res, ttl)
        )
      );
    };

  return {
    has: has(cache),
    getter: getter(cache),
    setter: setter(cache),
    cachedAction,
    // Expose metrics for monitoring
    getMetrics: () => ({ ...metrics }),
  };
};
