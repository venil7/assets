import { getUnixTime } from "date-fns";
import * as A from "fp-ts/lib/Array";
import { identity, pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import type { Ccy } from "../decoders";
import { YahooChartDataDecoder } from "../decoders/yahoo/chart";
import { DEFAULT_CHART_RANGE, type ChartRange } from "../decoders/yahoo/meta";
import { YahooTickerSearchResultDecoder } from "../decoders/yahoo/ticker";
import {
  handleError,
  intervalForRange,
  priceForDate,
  validationError,
  type ChartMeta,
  type Fx,
  type UnixDate,
  type YahooChartData,
  type YahooTickerSearchResult
} from "../domain";
import { now } from "../utils/date";
import { type Action, type Optional } from "../utils/utils";
import { methods, type Methods } from "./rest";

export const getYahooApi = (methods: Methods) => {
  const SEARCH_URL = (term: string) =>
    `https://query2.finance.yahoo.com/v1/finance/search?q=${term}`;
  const CHART_URL = (
    symbol: string,
    range: ChartRange = DEFAULT_CHART_RANGE
  ) => {
    const interval = intervalForRange(range);
    return `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=${interval}`;
  };

  const search = (term: string): Action<YahooTickerSearchResult> => {
    return pipe(
      methods.get<YahooTickerSearchResult>(
        SEARCH_URL(term),
        YahooTickerSearchResultDecoder
      )
    );
  };

  const chart = (
    symbol: string,
    range?: ChartRange
  ): Action<YahooChartData> => {
    return methods.get<YahooChartData>(
      CHART_URL(symbol, range),
      YahooChartDataDecoder
    );
  };

  const meta = (symbol: string): Action<ChartMeta> => {
    return pipe(
      chart(symbol),
      TE.map(({ meta }) => meta)
    );
  };

  const baseCcyConversionRate = (
    ccy: string,
    base: Ccy,
    date: Optional<Date> = undefined /**no date means latest market rate */
  ): Action<Fx> => {
    if (ccy === base)
      return TE.of({
        ccy,
        base,
        rate: 1,
        time: getUnixTime(date ?? now()) as UnixDate
      });
    if (ccy === "GBp" && base === "GBP")
      return TE.of({
        ccy,
        base,
        rate: 100,
        time: getUnixTime(date ?? now()) as UnixDate
      });

    const term = `${base}/${ccy}`;

    return pipe(
      TE.Do,
      TE.let("date", () => date),
      TE.bind("search", () => search(term)),
      TE.filterOrElse(
        ({ search }) => search.quotes.length > 0,
        handleError(`${term} is not convertible`)
      ),
      TE.let("symbol", ({ search }) => search.quotes[0].symbol),
      TE.bind("chart", ({ symbol, date }) =>
        chart(symbol, /*maybeRangeForDate(date)*/ "max")
      ),
      TE.map(({ chart, date }) => {
        let rate = priceForDate(chart, date);
        // if price in pence adjust accordingly
        if (ccy === "GBp") {
          rate *= 100;
        }
        const time = getUnixTime(date ?? now()) as UnixDate;
        return { ccy, base, rate, time };
      })
    );
  };

  const checkTickerExists = (ticker: string): Action<boolean> => {
    // logger.info(`checking symbol: ${ticker}`);
    return pipe(
      search(ticker),
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

  return { search, chart, meta, baseCcyConversionRate, checkTickerExists };
};

export type YahooApi = ReturnType<typeof getYahooApi>;

export const createYahooApi = () => {
  return pipe(methods(), getYahooApi);
};

export const yahooApi = createYahooApi();
