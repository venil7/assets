import { validationError, yahooApi, type Action } from "@darkruby/assets-core";
import { createLogger } from "@darkruby/fp-express";
import * as A from "fp-ts/lib/Array";
import { identity, pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";

const logger = createLogger("yahoo");

export const checkTickerExists = (ticker: string): Action<boolean> => {
  logger.info(`checking symbol: ${ticker}`);
  return pipe(
    yahooApi.search(ticker),
    TE.map((a) => a.quotes),
    TE.map(A.map((q) => q.symbol)),
    TE.map(
      A.exists((s) => s.toLocaleUpperCase() == ticker.toLocaleUpperCase())
    ),
    TE.filterOrElse(identity, () =>
      validationError(`Symbol '${ticker}' cannot be added`)
    )
  );
};
