import {
  generalError,
  type Action,
  type Nullable,
  type Result,
} from "@darkruby/assets-core";
import { liftE } from "@darkruby/assets-core/src/decoders/util";
import { createLogger } from "@darkruby/fp-express";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { type LRUCache } from "lru-cache";
import { createHash } from "node:crypto";

export type Stringifiable = string | number | Buffer | boolean;
export type Cache = LRUCache<Stringifiable, string>;

const toKey = (...k: Stringifiable[]) =>
  createHash("md5").update(k.map(String).join("")).digest("hex");

const log = createLogger("cache");

const has = (cache: Cache) => (key: string) => cache.has(key);

const getter =
  (cache: Cache) =>
  <T>(decoder: t.Type<T, string>) =>
  (key: string): Result<Nullable<T>> => {
    return pipe(
      E.tryCatch(
        () => cache.get(key),
        (e) => generalError(`${e}`)
      ),
      E.chain(liftE(decoder)),
      E.orElseW(() => E.of(null))
    );
  };

const setter =
  (cache: Cache) =>
  <T>(decoder: t.Type<T, string>) =>
  (key: string, val: T, ttl?: number): Result<void> => {
    return pipe(
      E.of(decoder.encode(val)),
      E.chain((enc) =>
        E.tryCatch(
          () => cache.set(key, enc, { ttl }),
          (e) => generalError(`${e}`)
        )
      ),
      E.map(() => undefined as void)
    );
  };

const cachedResult =
  (cache: Cache) =>
  <T>(decoder: t.Type<T, string>) =>
  (key: string, f: () => Result<T>, ttl?: number): Result<T> => {
    const get = pipe(decoder, getter(cache));
    const res = get(key);
    if (E.isRight(res) && res.right != null) {
      log.info(`cache hit for ${key}`);
      return res as Result<T>;
    }
    log.info(`cache miss for ${key}`);
    const set = pipe(decoder, setter(cache));

    return pipe(
      f(),
      E.tap((res) => set(key, res, ttl))
    );
  };

const cachedAction =
  (cache: Cache) =>
  <T>(decoder: t.Type<T, string>) =>
  (key: string, f: () => Action<T>, ttl?: number): Action<T> => {
    const get = pipe(decoder, getter(cache));
    const res = get(key);
    if (E.isRight(res) && res.right != null) {
      log.info(`cache hit for ${key}`);
      return TE.of(res) as Action<T>;
    }
    log.info(`cache miss for ${key}`);
    const set = pipe(decoder, setter(cache));

    return pipe(
      f(),
      TE.tap((res) => TE.of(set(key, res, ttl)))
    );
  };

export type AppCache = ReturnType<typeof createCache>;

export const createCache = (cache: Cache) => {
  return {
    toKey,
    has: has(cache),
    getter: getter(cache),
    setter: setter(cache),
    cachedResult: cachedResult(cache),
    cachedAction: cachedAction(cache),
  };
};
