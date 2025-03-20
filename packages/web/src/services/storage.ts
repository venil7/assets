import { generalError, type Result } from "@darkruby/assets-core";
import { liftE } from "@darkruby/assets-core/src/decoders/util";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { Json, JsonFromString } from "io-ts-types";

const reader =
  <T>(decoder: t.Decoder<string, T>) =>
  (key: string): Result<T> =>
    pipe(
      E.tryCatch(
        () => localStorage.getItem(key) ?? "",
        (e) => generalError((e as Error).message)
      ),
      E.chain(liftE(decoder))
    );

const writer =
  <T>(decoder: t.Encoder<T, string>) =>
  (key: string, value: T): Result<void> =>
    pipe(
      E.tryCatch(
        () => localStorage.setItem(key, decoder.encode(value)),
        (e) => generalError((e as Error).message)
      )
    );

export const storage = <T extends Json>(decoder: t.Type<any, T>) => {
  const dec = JsonFromString.pipe(decoder);
  const read = reader<T>(dec);
  const write = writer<T>(dec);
  return { read, write };
};
