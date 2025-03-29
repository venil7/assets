import * as t from "io-ts";
import type {
  YahooTickerDecoder,
  YahooTickerSearchResultDecoder,
} from "../decoders";

export type Ticker = t.TypeOf<typeof YahooTickerDecoder>;

export type TickerSearchResult = t.TypeOf<
  typeof YahooTickerSearchResultDecoder
>;
