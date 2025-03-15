import type { RequestHandler } from "express";

export enum WebErrorType {
  Auth = "Auth",
  NotFound = "NotFound",
  BadRequest = "BadRequest",
  General = "General",
  Next = "Next",
}

export type WebAppError = {
  type: WebErrorType;
  message: string;
};

const stringifyUnknownError = (reason: unknown) => {
  if (reason) {
    if ((reason as Error).message) {
      return (reason as Error).message;
    }
    return JSON.stringify(reason);
  }
  return "Unknown error";
};

export const notFound = <E = unknown>(reason: E): WebAppError => ({
  type: WebErrorType.NotFound,
  message: "Not Found",
});

export const next = (): WebAppError => ({
  type: WebErrorType.Next,
  message: "",
});
export const authError = <E = unknown>(reason: E): WebAppError => ({
  type: WebErrorType.Auth,
  message: stringifyUnknownError(reason),
});

export const generalError = <E = unknown>(reason: E): WebAppError => ({
  type: WebErrorType.General,
  message: stringifyUnknownError(reason),
});

export const badRequest = <E = unknown>(reason: E): WebAppError => ({
  type: WebErrorType.BadRequest,
  message: stringifyUnknownError(reason),
});

export type HandlerContext<Ctx> = {
  params: Parameters<RequestHandler>;
  context: Ctx;
};
