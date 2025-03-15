import { pipe } from "fp-ts/lib/function";
import { YahooTickerSearchResultDecoder } from "../decoders/yahoo";
import type { YahooTickerSearchResult } from "../domain/yahoo";
import { methods, type Methods } from "./rest";

export const getYahooApi = (methods: Methods) => {
  const SEARCH_URL = `https://query2.finance.yahoo.com/v1/finance/search`;

  const search = (term: string) =>
    methods.get<YahooTickerSearchResult>(
      `${SEARCH_URL}?q=${term}`,
      YahooTickerSearchResultDecoder
    );

  return { search };
};

export type YahooApi = ReturnType<typeof getYahooApi>;

export const yahooApi = () => {
  return pipe(methods(), getYahooApi);
};
