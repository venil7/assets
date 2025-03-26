import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";

const tickerTypes = {
  exchange: t.string,
  shortname: t.string,
  quoteType: t.string,
  symbol: t.string,
  longname: t.string,
};

export const YahooTickerDecoder = pipe(t.type(tickerTypes), t.exact);
export const YahooTickerSearchResultDecoder = pipe(
  t.type({
    quotes: t.array(YahooTickerDecoder),
  }),
  t.exact
);
