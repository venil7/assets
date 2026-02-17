import { AppErrorType, type AppError } from "@darkruby/assets-core";
import * as TE from "fp-ts/lib/TaskEither";
import {
  authError,
  badRequest,
  generalError,
  WebErrorType,
  type WebAppError
} from "../fp-express";

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

export const mapWebError = TE.mapLeft(toWebError);

export const handleWebError =
  (msg: string = "", type: WebErrorType = WebErrorType.General) =>
  (e: unknown): WebAppError => ({
    message: `${msg}: ${e}`,
    type
  });
