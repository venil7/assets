import * as t from "io-ts";
import type { YahooChartDataDecoder } from "../decoders/yahoo/chart";
import type {
  YahooTickerDecoder,
  YahooTickerSearchResultDecoder,
} from "../decoders/yahoo/ticker";

export type YahooTicker = t.TypeOf<typeof YahooTickerDecoder>;
export type YahooTickerSearchResult = t.TypeOf<
  typeof YahooTickerSearchResultDecoder
>;

export type YahooChartData = t.TypeOf<typeof YahooChartDataDecoder>;
export type ChartMeta = YahooChartData["meta"];
export type ChartData = YahooChartData["chart"];
