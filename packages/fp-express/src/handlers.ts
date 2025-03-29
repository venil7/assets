import type { RequestHandler } from "express";
import * as RT from "fp-ts/ReaderTask";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as I from "fp-ts/lib/Identity";
import * as T from "fp-ts/lib/Task";
import { pipe } from "fp-ts/lib/function";
import { WebErrorType, type HandlerContext, type WebAppError } from "./error";
import { createLogger } from "./log";

const logger = createLogger("express");

type ErrorHandler<Ctx> = (
  err: WebAppError
) => RT.ReaderTask<HandlerContext<Ctx>, unknown>;

const errorHandler: ErrorHandler<unknown> =
  (err) =>
  ({ params: [{ baseUrl, url, method }, res, next] }) =>
    T.fromIO(() => {
      const error = (code: number) =>
        logger.error(
          `${code}: ${method} ${baseUrl + url} - ${err.type} -  ${err.message}`
        );

      switch (err.type) {
        case WebErrorType.Auth:
          error(403);
          return res
            .status(403)
            .header("content-type", "application/json")
            .send(err);
        case WebErrorType.BadRequest:
          error(400);
          return res
            .status(400)
            .header("content-type", "application/json")
            .send(err);
        case WebErrorType.NotFound:
          error(404);
          return res
            .status(404)
            .header("content-type", "application/json")
            .send(err);
        case WebErrorType.Next:
          return next();
        case WebErrorType.General:
        default:
          error(500);
          return res
            .status(500)
            .header("content-type", "application/json")
            .send(err);
      }
    });

type SuccessHandler<Ctx> = <T>(
  data: T
) => RT.ReaderTask<HandlerContext<Ctx>, unknown>;

const successHandler: SuccessHandler<unknown> =
  <T>(data: T) =>
  ({ params: [{ baseUrl, url, method }, res] }) =>
    T.fromIO(() => {
      const code = method.toLowerCase() === "POST" ? 201 : 200;
      logger.info(`${code}: ${method} ${baseUrl + url}`);
      res.status(code).send(data);
    });

export type HandlerTask<T, Ctx = unknown> = RTE.ReaderTaskEither<
  HandlerContext<Ctx>,
  WebAppError,
  T
>;

export const createRequestHandler =
  <T, Ctx>(context: Ctx) =>
  (task: HandlerTask<T, Ctx>): RequestHandler =>
  (req, res, next) =>
    pipe(
      task,
      RTE.filterOrElse<WebAppError, T>(
        (x) => x !== null || x != undefined,
        () => ({ type: WebErrorType.NotFound, message: `not found` })
      ),
      RTE.fold<HandlerContext<Ctx>, WebAppError, T, any>(
        errorHandler,
        successHandler
      ),
      I.ap<HandlerContext<Ctx>>({ params: [req, res, next], context })
    )();
