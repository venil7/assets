import { type Ccy, type Optional, type UnixDate } from "@darkruby/assets-core";
import {
  DEFAULT_CHART_RANGE,
  type ChartRange
} from "@darkruby/assets-core/src/decoders/yahoo/meta";
import { createLogger } from "../fp-express";

import ms from "ms";
import type { AppCache } from "../services/cache";
import { yahooApi as rawYahooApi, type YahooApi } from "./client";

const logger = createLogger("cached yahoo");

export const cachedYahooApi = (cache: AppCache): YahooApi => {
  const MIN_1 = ms("1min");
  const MIN_10 = ms("10min");
  const HOUR_1 = ms("1hr");

  const search = (term: string) =>
    cache.cachedAction(
      `yahoo-search-${term}`,
      () => rawYahooApi.search(term),
      MIN_10
    );

  const chart = (symbol: string, range?: ChartRange) =>
    cache.cachedAction(
      `yahoo-chart-${symbol}-${range ?? DEFAULT_CHART_RANGE}`,
      () => rawYahooApi.chart(symbol, range),
      MIN_1
    );

  const meta = (symbol: string) =>
    cache.cachedAction(
      `yahoo-meta-${symbol}`,
      () => rawYahooApi.meta(symbol),
      HOUR_1
    );

  const fxRate = (ccy: string, base: Ccy, ts: Optional<UnixDate>) =>
    cache.cachedAction(
      `yahoo-ccy-lookup-${ccy}-${base}-${ts ?? "latest"}`,
      () => rawYahooApi.fxRate(ccy, base, ts),
      HOUR_1
    );

  const quote = (ticker: string, ts: Optional<UnixDate>) =>
    cache.cachedAction(
      `yahoo-quote-lookup-${ticker}-${ts ?? "latest"}`,
      () => rawYahooApi.quote(ticker, ts),
      HOUR_1
    );

  const checkTickerExists = (symbol: string) =>
    cache.cachedAction(
      `yahoo-check-ticker-${symbol}`,
      () => rawYahooApi.checkTickerExists(symbol),
      HOUR_1
    );

  const fxRates = (ccy: string, base: Ccy) =>
    cache.cachedAction(
      `yahoo-fx-rates-${ccy}-${base}`,
      () => rawYahooApi.fxRates(ccy, base),
      HOUR_1
    );

  return {
    meta,
    quote,
    chart,
    search,
    fxRate,
    fxRates,
    checkTickerExists
  };
};
