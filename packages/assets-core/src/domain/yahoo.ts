import * as t from "io-ts";
import type {
  YahooTickerDecoder,
  YahooTickerSearchResultDecoder,
} from "../decoders/yahoo";

export type YahooTicker = t.TypeOf<typeof YahooTickerDecoder>;
export type YahooTickerSearchResult = t.TypeOf<
  typeof YahooTickerSearchResultDecoder
>;
