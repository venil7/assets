import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as t from "io-ts";
import { type ValidationError, type Errors as ValidationErrors } from "io-ts";
import { formatValidationErrors } from "io-ts-reporters";
import { AppErrorDecoder, AppErrorType } from "../decoders/error";

export type AppError = t.TypeOf<typeof AppErrorDecoder>;

export const authError = (message: string): AppError => ({
  message,
  type: AppErrorType.Auth
});

export const generalError = (message: string): AppError => ({
  message,
  type: AppErrorType.General
});

export const validationError = (message: string): AppError => ({
  message,
  type: AppErrorType.Validation
});

export const handleError =
  (msg: string = "", type: AppErrorType = AppErrorType.General) =>
  (e: any): AppError => {
    const debug = false;
    const message = `${msg}: ${debug ? JSON.stringify(e.stack) : JSON.stringify(e)}`;
    return {
      message,
      type
    };
  };

export const fromValidationError = (
  val: ValidationError,
  fallbackMessage = "validation error"
): AppError => {
  return {
    type: AppErrorType.Validation,
    message: pipe(
      formatValidationErrors([val]),
      A.head,
      O.getOrElse(() => fallbackMessage)
    )
  };
};

export const validationErrors = (vals: ValidationErrors): AppError =>
  fromValidationError(vals[0]);
