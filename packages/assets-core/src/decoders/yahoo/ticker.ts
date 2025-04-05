import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { nullableDecoder } from "../util";

const tickerTypes = {
  exchange: t.string,
  shortname: nullableDecoder(t.string),
  quoteType: t.string,
  symbol: t.string,
};

export const YahooTickerDecoder = pipe(t.type(tickerTypes), t.exact);
export const YahooTickerSearchResultDecoder = pipe(
  t.type({
    quotes: t.array(YahooTickerDecoder),
  }),
  t.exact
);
