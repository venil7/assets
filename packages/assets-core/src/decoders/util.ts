import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import type { NonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import * as RTE from "fp-ts/lib/ReaderTaskEither";
import * as TE from "fp-ts/lib/TaskEither";
import * as t from "io-ts";
import {
  BooleanFromNumber,
  BooleanFromString,
  DateFromISOString,
  DateFromNumber,
  DateFromUnixTime,
  date,
} from "io-ts-types";
import { validationErrors, type AppError } from "../domain/error";
import type { Optional } from "../utils/utils";
import { NumberDecoder } from "./number";

export const liftE = <T, U = unknown>(decoder: t.Decoder<U, T>) => {
  return (data: U) => {
    return pipe(data, decoder.decode, E.mapLeft(validationErrors));
  };
};

export const liftTE = <T, U = unknown>(decoder: t.Decoder<U, T>) => {
  return (data: U) => {
    return pipe(
      data,
      decoder.decode,
      TE.fromEither,
      TE.mapLeft(validationErrors)
    );
  };
};

export const liftRTE = <T, R, U = unknown>(decoder: t.Decoder<U, T>) => {
  return (data: U) =>
    pipe(data, liftTE(decoder), RTE.fromTaskEither<AppError, T, R>);
};

export const nullableDecoder = <T>(
  decoder: t.Type<T, any, any>
): t.Type<Optional<T>, any> => {
  return t.union([t.null, t.undefined, decoder]);
};

export const dateDecoder: t.Type<Date, any> = t.union([
  DateFromISOString,
  DateFromUnixTime,
  DateFromNumber,
  date,
]);

export const boolean: t.Type<boolean, any> = t.union([
  BooleanFromNumber,
  BooleanFromString,
  t.boolean,
]);

export const chainDecoder =
  <A, R>(f: (a: A) => t.Validation<R>) =>
  (codec: t.Type<A, any>, name: string = codec.name): t.Type<R, A> => {
    return new t.Type<R, A>(
      name,
      (u): u is R => codec.is(u) && E.isRight(f(u as A)),
      (i, c) => pipe(codec.validate(i, c), E.chain(f)),
      (r) => codec.encode(r as any as A) as any as A
    );
  };

export const validationErr = (
  message: string,
  value: any = null
): t.ValidationError => ({
  message,
  value,
  context: [],
});

export function nonEmptyArray<T>(
  codec: t.Type<T, any, any>,
  errorMessage = `Array ${codec.name} can't be empty`
) {
  return pipe(
    t.array(codec),
    chainDecoder((a) =>
      a.length
        ? E.of(a as NonEmptyArray<T>)
        : E.left([validationErr(errorMessage)])
    )
  );
}

export const nonEmptyString = pipe(
  t.string,
  chainDecoder((s) =>
    s.trim() === "" ? E.left([validationErr(`Can't be empty`)]) : E.of(s)
  )
);

export const nonNegative = pipe(
  NumberDecoder as t.Type<number>,
  chainDecoder((n) =>
    n <= 0 ? E.left([validationErr(`Can't be negative`)]) : E.of(n)
  )
);
