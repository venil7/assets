import type { RequestHandler } from "express";
import * as RT from "fp-ts/ReaderTask";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as I from "fp-ts/lib/Identity";
import * as T from "fp-ts/lib/Task";
import { pipe } from "fp-ts/lib/function";
import { WebErrorType, type HandlerContext, type WebAppError } from "./error";

type ErrorHandler<Ctx> = (
  err: WebAppError
) => RT.ReaderTask<HandlerContext<Ctx>, unknown>;

const errorHandler: ErrorHandler<unknown> =
  (err) =>
  ({ params: [_, res, next] }) =>
    T.fromIO(() => {
      console.error([err.type, err.message]);
      switch (err.type) {
        case WebErrorType.Auth:
          return res
            .status(403)
            .header("content-type", "application/json")
            .send(err);
        case WebErrorType.BadRequest:
          return res
            .status(400)
            .header("content-type", "application/json")
            .send(err);
        case WebErrorType.NotFound:
          return res
            .status(404)
            .header("content-type", "application/json")
            .send(err);
        case WebErrorType.Next:
          return next();
        case WebErrorType.General:
        default:
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
  ({ params: [_, res] }) =>
    T.fromIO(() => {
      console.info(["ok"]);
      res.status(200).send(data);
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
