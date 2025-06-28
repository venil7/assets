import { pipe } from "fp-ts/lib/function";
import { YahooChartDataDecoder } from "../decoders/yahoo/chart";
import { DEFAULT_CHART_RANGE, type ChartRange } from "../decoders/yahoo/meta";
import { YahooTickerSearchResultDecoder } from "../decoders/yahoo/ticker";
import {
  intervalForRange,
  type YahooChartData,
  type YahooTickerSearchResult,
} from "../domain/yahoo";
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

  const search = (term: string) => {
    return methods.get<YahooTickerSearchResult>(
      SEARCH_URL(term),
      YahooTickerSearchResultDecoder
    );
  };

  const chart = (symbol: string, range?: ChartRange) => {
    return methods.get<YahooChartData>(
      CHART_URL(symbol, range),
      YahooChartDataDecoder
    );
  };

  return { search, chart };
};

export type YahooApi = ReturnType<typeof getYahooApi>;

export const createYahooApi = () => {
  return pipe(methods(), getYahooApi);
};

export const yahooApi = createYahooApi();
