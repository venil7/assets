import * as E from "fp-ts/lib/Either";
import * as RTE from "fp-ts/lib/ReaderTaskEither";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import {
  BooleanFromNumber,
  BooleanFromString,
  DateFromISOString,
  DateFromNumber,
  DateFromUnixTime,
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
  DateFromISOString,
  DateFromUnixTime,
  DateFromNumber,
]);

export const boolean: t.Type<boolean, any> = t.union([
  BooleanFromNumber,
  BooleanFromString,
  t.boolean,
]);

export const IdDecoder = t.type({
  id: t.number,
});
