import { AppErrorType, type AppError } from "@darkruby/assets-core";
import {
  authError,
  badRequest,
  generalError,
  type WebAppError,
} from "@darkruby/fp-express";

export const toWebError = (err: AppError): WebAppError => {
  switch (err.type) {
    case AppErrorType.Auth:
      return authError(err);
    case AppErrorType.Validation:
      return badRequest(err);
    case AppErrorType.General:
    default:
      return generalError(err);
  }
};
