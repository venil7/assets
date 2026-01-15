import {
  generalError,
  handleError,
  type Action,
  type Nullable,
} from "@darkruby/assets-core";
import { flow, pipe } from "fp-ts/lib/function";
import * as IO from "fp-ts/lib/IOEither";
import * as TE from "fp-ts/lib/TaskEither";
import ms from "ms";

export const env = <S extends string>(
  name: string,
  defaultValue: Nullable<string> = null
): Action<S> =>
  pipe(
    IO.tryCatch(() => {
      const val = process.env[name] ?? defaultValue;
      if (val) return val as S;
      throw Error(`${name} is not defined`);
    }, handleError("Environment variable")),
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
        IO.tryCatch(() => parseFloat(s), handleError("parseFloat")),
        TE.fromIOEither
      )
    )
  );

// reads ms.StringValue fron env, returns number of milliseconds
export const envDurationMsec = (
  name: string,
  defaultValue: ms.StringValue
): Action<number /**milliseconds */> =>
  pipe(
    env(name, defaultValue),
    TE.map((s) => ms(s as ms.StringValue)),
    TE.filterOrElseW(
      (n) => n != undefined,
      () => generalError(`not an ms.StringValue`)
    ),
    TE.orElse(() => TE.of(ms(defaultValue)))
  );

export const envDurationSec = flow(
  envDurationMsec,
  TE.map((x) => x / 1000)
);

export const envBoolean = (
  name: string,
  defaultValue: Nullable<boolean> = null
): Action<boolean> =>
  pipe(
    env(name, defaultValue?.toString()),
    TE.map((s) => s.toLowerCase().trim() === "true")
  );
