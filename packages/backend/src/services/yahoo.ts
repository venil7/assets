import {
  yahooApi as rawYahooApi,
  validationError,
  type Action,
  type YahooApi,
} from "@darkruby/assets-core";
import { createLogger } from "@darkruby/fp-express";
import * as A from "fp-ts/lib/Array";
import { identity, pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import type { AppCache } from "./cache";

const logger = createLogger("cached yahoo");

export const cachedYahooApi = (cache: AppCache): YahooApi => {
  const CHART_TTL = 1000 * 60 * 1; // 1 minutes
  const SEARCH_TTL = 1000 * 60 * 10; // 10 minutes
  return {
    search: (term: string) =>
      cache.cachedAction(
        `yaho-search-${term}`,
        () => rawYahooApi.search(term),
        SEARCH_TTL
      ),
    chart: (symbol: string) =>
      cache.cachedAction(
        `yaho-chart-${symbol}`,
        () => rawYahooApi.chart(symbol),
        CHART_TTL
      ),
  };
};

export const checkTickerExists =
  (yahooApi: YahooApi) =>
  (ticker: string): Action<boolean> => {
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
