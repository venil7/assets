import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import {
  nonEmptyString,
  validationErr,
  withErrorMessage
} from "../decoders/util";

export type Validator = ReturnType<typeof createValidator>;

export const createValidator =
  <T>(decoder: t.Decoder<unknown, T>) =>
  (value: unknown) => {
    const v = decoder.decode(value);
    return {
      get errors() {
        if (E.isLeft(v)) {
          const errors = v.left.map((e) => {
            return e.message ?? "Validation error";
          });
          return errors;
        }
        return [];
      },
      get valid() {
        return E.isRight(v);
      }
    };
  };

export const defaultValidator = createValidator(t.any);

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
export const alphaNumOnly = (str: string) =>
  filter(() => /^[a-zA-Z0-9]*$/.test(str), `Alpa numeric only`);

export const nonEmptyField = (fieldName: string) =>
  pipe(nonEmptyString, withErrorMessage(`${fieldName} can't be empty`));
