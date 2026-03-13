import {
  DEFAULT_CHART_RANGE,
  fuzzyIndexSearch,
  handleError,
  intervalForRange,
  methods,
  now,
  unixTimestamp,
  validationError,
  YahooChartDataDecoder,
  YahooTickerSearchResultDecoder,
  type Action,
  type Ccy,
  type ChartMeta,
  type ChartRange,
  type Fx,
  type FxRates,
  type FxRecord,
  type Methods,
  type Optional,
  type UnixDate,
  type YahooChartData,
  type YahooTickerSearchResult
} from "@darkruby/assets-core";
import { getUnixTime } from "date-fns";
import * as A from "fp-ts/lib/Array";
import { identity, pipe } from "fp-ts/lib/function";
import * as NEA from "fp-ts/lib/NonEmptyArray";
import * as TE from "fp-ts/lib/TaskEither";

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

  const fxRates = (ccy: string, base: Ccy): Action<FxRates> => {
    if (ccy === base) {
      const latest = { rate: 1, timestamp: unixTimestamp(0) };
      return TE.of({
        ccy,
        base,
        rates: NEA.of(latest),
        latest
      });
    }
    if (ccy === "GBp" && base === "GBP") {
      const latest = { rate: 100, timestamp: unixTimestamp(0) };
      return TE.of({
        ccy,
        base,
        rates: NEA.of(latest),
        latest
      });
    }

    const term = `${base}/${ccy}`;

    return pipe(
      TE.Do,
      TE.bind("search", () => search(term)),
      TE.filterOrElse(
        ({ search }) => search.quotes.length > 0,
        handleError(`${term} fx rate is not available`)
      ),
      TE.let("symbol", ({ search }) => search.quotes[0].symbol),
      TE.bind("chart", ({ symbol }) => chart(symbol, "max")),
      TE.map(({ chart }) => {
        const factor = ccy == "GBp" ? 100 : 1;
        const rates = pipe(
          chart.chart,
          NEA.map(({ timestamp, price }) => ({
            timestamp,
            rate: price * factor
          }))
        );
        return {
          ccy,
          base,
          rates,
          latest: {
            rate: chart.meta.regularMarketPrice,
            timestamp: chart.meta.regularMarketTime
          }
        };
      })
    );
  };

  const fxRate = (
    ccy: string,
    base: Ccy,
    date: Optional<Date> = undefined /**no date means latest market rate */
  ): Action<Fx> => {
    return pipe(
      fxRates(ccy, base),
      TE.map(({ rates }) => {
        if (rates.length == 1) {
          return {
            ccy,
            base,
            rate: rates[0].rate,
            timestamp: getUnixTime(date ?? now()) as UnixDate
          };
        }

        const fuzzyFindIndex = fuzzyIndexSearch<FxRecord>(
          (item) => item.timestamp
        );

        const idx = pipe(rates, fuzzyFindIndex(getUnixTime(date ?? now())));
        return {
          ccy,
          base,
          rate: rates[idx].rate,
          timestamp: rates[idx].timestamp
        };
      })
    );
  };

  const checkTickerExists = (ticker: string): Action<boolean> => {
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

  return {
    meta,
    chart,
    search,
    fxRate,
    fxRates,
    checkTickerExists
  };
};

export type YahooApi = ReturnType<typeof getYahooApi>;

export const createYahooApi = () => {
  return pipe(methods(), getYahooApi);
};

export const yahooApi = createYahooApi();
