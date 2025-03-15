import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { type ValidationError, type Errors as ValidationErrors } from "io-ts";
import { formatValidationError } from "io-ts-reporters";

export enum AppErrorType {
  General = "General",
  Validation = "Validation",
  Auth = "Auth",
}
export type AppError = { type: AppErrorType; message: string };

export const authError = (message: string): AppError => ({
  message,
  type: AppErrorType.Auth,
});

export const generalError = (message: string): AppError => ({
  message,
  type: AppErrorType.General,
});

export const validationError = (
  val: ValidationError,
  fallbackMessage = "validation error"
): AppError => {
  return {
    type: AppErrorType.Validation,
    message: pipe(
      formatValidationError(val),
      O.getOrElse(() => fallbackMessage)
    ),
  };
};

export const validationErrors = (vals: ValidationErrors): AppError =>
  validationError(vals[0]);
