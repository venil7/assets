import * as RTE from "fp-ts/ReaderTaskEither";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { generalError, type WebAppError } from "./error";

export const fromTryCatch = <Ctx, A>(
  func: (r: Ctx) => Promise<A>,
  onError: (e: unknown) => WebAppError = generalError
) =>
  RTE.asksReaderTaskEither((ctx: Ctx) =>
    pipe(
      TE.tryCatch(() => func(ctx), onError),
      RTE.fromTaskEither
    )
  );
