import {
  yahooApi as rawYahooApi,
  type Ccy,
  type Optional,
  type YahooApi
} from "@darkruby/assets-core";
import {
  DEFAULT_CHART_RANGE,
  type ChartRange
} from "@darkruby/assets-core/src/decoders/yahoo/meta";
import { createLogger } from "../fp-express";

import type { AppCache } from "./cache";

const logger = createLogger("cached yahoo");

export const cachedYahooApi = (cache: AppCache): YahooApi => {
  const CHART_TTL = 1000 * 60 * 10; // 1 minutes
  const SEARCH_TTL = 1000 * 60 * 10; // 10 minutes
  const LOOKUP_TTL = 1000 * 60 * 60; // 1 hr

  const search = (term: string) =>
    cache.cachedAction(
      `yahoo-search-${term}`,
      () => rawYahooApi.search(term),
      SEARCH_TTL
    );

  const chart = (symbol: string, range?: ChartRange) =>
    cache.cachedAction(
      `yahoo-chart-${symbol}-${range ?? DEFAULT_CHART_RANGE}`,
      () => rawYahooApi.chart(symbol, range),
      CHART_TTL
    );

  const meta = (symbol: string) =>
    cache.cachedAction(
      `yahoo-meta-${symbol}`,
      () => rawYahooApi.meta(symbol),
      LOOKUP_TTL
    );

  const fxRate = (ccy: string, base: Ccy, date?: Optional<Date>) =>
    cache.cachedAction(
      `yahoo-ccy-lookup-${ccy}-${base}-${date?.getTime() ?? "latest"}`,
      () => rawYahooApi.fxRate(ccy, base, date),
      LOOKUP_TTL
    );

  const checkTickerExists = (symbol: string) =>
    cache.cachedAction(
      `yahoo-check-ticker-${symbol}`,
      () => rawYahooApi.checkTickerExists(symbol),
      LOOKUP_TTL
    );

  const fxRates = (ccy: string, base: Ccy) =>
    cache.cachedAction(
      `yahoo-fx-rates-${ccy}-${base}`,
      () => rawYahooApi.fxRates(ccy, base),
      LOOKUP_TTL
    );

  return {
    meta,
    chart,
    search,
    fxRate,
    fxRates,
    checkTickerExists
  };
};
