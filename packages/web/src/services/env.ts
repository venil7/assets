import { generalError, type Nullable } from "@darkruby/assets-core";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";

export const env = (
  name: string,
  defaultValue: Nullable<string> = null
) /*: Action<string>*/ =>
  pipe(
    E.tryCatch(
      () => {
        const val = import.meta.env[name] ?? defaultValue;
        if (val) return val as string;
        throw Error(`${name} is not defined`);
      },
      (e) => generalError((e as Error).message)
    )
  );

export const envNumber = (
  name: string,
  defaultValue: Nullable<number> = null
) =>
  pipe(
    env(name, defaultValue?.toString()),
    E.chain((s) =>
      E.tryCatch(
        () => parseFloat(s),
        (e) => generalError((e as Error).message)
      )
    )
  );

export const envBoolean = (
  name: string,
  defaultValue: Nullable<boolean> = null
) =>
  pipe(
    env(name, defaultValue?.toString()),
    E.map((s) => s.toLowerCase().trim() === "true")
  );
