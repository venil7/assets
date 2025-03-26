import { pipe } from "fp-ts/lib/function";
import { YahooChartDataDecoder } from "../decoders/yahoo/chart";
import { YahooTickerSearchResultDecoder } from "../decoders/yahoo/ticker";
import type { YahooChartData, YahooTickerSearchResult } from "../domain/yahoo";
import { methods, type Methods } from "./rest";

export const getYahooApi = (methods: Methods) => {
  const SEARCH_URL = (term: string) =>
    `https://query2.finance.yahoo.com/v1/finance/search?q=${term}`;
  const CHART_URL = (symbol: string) =>
    `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;

  const search = (term: string) =>
    methods.get<YahooTickerSearchResult>(
      SEARCH_URL(term),
      YahooTickerSearchResultDecoder
    );

  const chart = (symbol: string) =>
    methods.get<YahooChartData>(CHART_URL(symbol), YahooChartDataDecoder);

  return { search, chart };
};

export type YahooApi = ReturnType<typeof getYahooApi>;

export const createYahooApi = () => {
  return pipe(methods(), getYahooApi);
};

export const yahooApi = createYahooApi();
