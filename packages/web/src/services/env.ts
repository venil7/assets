import { handleError, type Nullable } from "@darkruby/assets-core";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";

export const env = (name: string, defaultValue?: string) =>
  pipe(
    E.tryCatch(() => {
      const val = import.meta.env[name] ?? defaultValue;
      if (val !== undefined) return val;
      throw Error(`${name} is not defined`);
    }, handleError("env"))
  );

export const envNumber = (
  name: string,
  defaultValue: Nullable<number> = null
) =>
  pipe(
    env(name, defaultValue?.toString()),
    E.chain((s) => E.tryCatch(() => parseFloat(s), handleError("parseFloat")))
  );

export const envBoolean = (
  name: string,
  defaultValue: Nullable<boolean> = null
) =>
  pipe(
    env(name, defaultValue?.toString()),
    E.map((s) => s.toLowerCase().trim() === "true")
  );
