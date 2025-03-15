import {
  generalError,
  type Action,
  type Nullable,
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as IO from "fp-ts/lib/IOEither";
import * as TE from "fp-ts/lib/TaskEither";

export const env = (
  name: string,
  defaultValue: Nullable<string> = null
): Action<string> =>
  pipe(
    IO.tryCatch(
      () => {
        const val = process.env[name] ?? defaultValue;
        if (val) return val;
        throw Error(`${name} is not defined`);
      },
      (e) => generalError((e as Error).message)
    ),
    TE.fromIOEither
  );

export const envNumber = (
  name: string,
  defaultValue: Nullable<number> = null
): Action<number> =>
  pipe(
    env(name, defaultValue?.toString()),
    TE.chain((s) =>
      pipe(
        IO.tryCatch(
          () => parseFloat(s),
          (e) => generalError((e as Error).message)
        ),
        TE.fromIOEither
      )
    )
  );

export const envBoolean = (
  name: string,
  defaultValue: Nullable<boolean> = null
): Action<boolean> =>
  pipe(
    env(name, defaultValue?.toString()),
    TE.map((s) => s.toLowerCase().trim() === "true")
  );
