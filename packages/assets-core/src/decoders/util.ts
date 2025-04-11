import * as A from "fp-ts/lib/Array";
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
import { validationErrors, type AppError } from "../domain";
import type { Optional } from "../utils/utils";

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
  date,
  DateFromISOString,
  DateFromUnixTime,
  DateFromNumber,
]);

export const boolean: t.Type<boolean, any> = t.union([
  BooleanFromNumber,
  BooleanFromString,
  t.boolean,
]);

export const EnumDecoder = <TEnum extends string>(enumObj: {
  [k in string]: TEnum;
}): t.Type<TEnum, string> =>
  pipe(
    Object.values(enumObj) as string[],
    A.map((v: string) => t.literal(v) as t.Mixed),
    (codecs) => t.union(codecs as [t.Mixed, t.Mixed, ...t.Mixed[]])
  );

export function mapDecoder<A, R>(
  codec: t.Type<A>,
  f: (a: A) => t.Validation<R>,
  name: string = codec.name
): t.Type<R, A> {
  return new t.Type<R, A>(
    name,
    (u): u is R => codec.is(u) && E.isRight(f(u as A)),
    (i, c) => pipe(codec.validate(i, c), E.chain(f)),
    (a) => codec.encode(a as unknown as A)
  );
}

export const validationErr = (
  message: string,
  value: any = null
): t.ValidationError => ({
  message,
  value,
  context: [],
});

export function nonEmptyArray<T>(codec: t.Type<T>) {
  return mapDecoder(t.array(codec), (a) =>
    a.length
      ? E.of(a as NonEmptyArray<T>)
      : E.left([validationErr(`empty array ${codec.name}`)])
  );
}
