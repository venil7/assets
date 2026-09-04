import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as RTE from "fp-ts/lib/ReaderTaskEither";
import * as TE from "fp-ts/lib/TaskEither";
import * as t from "io-ts";
import { nonFuture } from "../decoders/date";
import { validationErr, withErrorMessage } from "../decoders/error";
import { nonNegative } from "../decoders/number";
import { nonEmptyString } from "../decoders/string";
import { validationErrors, type AppError } from "../domain/error";
import type { Optional } from "../utils/utils";

export const filter = (predicate: () => boolean, message: string) =>
  E.filterOrElse(predicate, () => [validationErr(message)]);

export const match = (pwd: string, pwd2: string) =>
  filter(() => pwd == pwd2, `Passwords do not match`);
export const length = (n: number) => (pwd: string) =>
  filter(() => pwd.length >= n, `Length must be >=${n}`);
export const upper = (pwd: string) =>
  filter(() => /[A-Z]/.test(pwd), `Uppercase characters missing`);
export const lower = (pwd: string) =>
  filter(() => /[a-z]/.test(pwd), `Lower characters missing`);
export const numbers = (pwd: string) =>
  filter(() => /\d/.test(pwd), `Number characters missing`);
export const special = (pwd: string) =>
  filter(() => /\W/.test(pwd), `Special characters missing`);
export const noWhiteSpace = (pwd: string) =>
  filter(() => !/\s/.test(pwd), `No whitespace`);
export const startsWithLetter = (str: string) =>
  filter(() => /^[a-zA-Z]/.test(str), `Should start with a letter`);
export const alphaNumOnly = (str: string) =>
  filter(
    () => /^[a-zA-Z0-9\.\-_]*$/.test(str),
    `Alpha numeric characters only`
  ); //alpha chards, numbers, dot and underscore

export const nonEmptyField = (fieldName: string) =>
  pipe(nonEmptyString, withErrorMessage(`${fieldName} can't be empty`));

export const nonNegativeField = (fieldName: string) =>
  pipe(nonNegative, withErrorMessage(`${fieldName} can't be zero or less`));

export const nonFutureDate = (fieldName: string) =>
  pipe(nonFuture, withErrorMessage(`${fieldName} can't be in future`));

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
  return t.union([decoder, t.null, t.undefined]);
};

export const chainDecoder =
  <A, R>(f: (a: A) => t.Validation<R>) =>
  (
    codec: t.Type<A, any>,
    name: string = `Chained(${codec.name})`
  ): t.Type<R, A> => {
    return new t.Type<R, A>(
      name,
      (u): u is R => codec.is(u) && E.isRight(f(u as A)),
      (i, c) => pipe(codec.validate(i, c), E.chain(f)),
      (r) => codec.encode(r as any as A) as any as A
    );
  };
