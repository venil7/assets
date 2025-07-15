import { format } from "date-fns";
import * as t from "io-ts";
import type { YahooChartDataDecoder } from "../decoders/yahoo/chart";
import type { ChartInterval, ChartRange } from "../decoders/yahoo/meta";
import type {
  YahooTickerDecoder,
  YahooTickerSearchResultDecoder,
} from "../decoders/yahoo/ticker";
import type { ArrayItem } from "../utils/utils";

export type YahooTicker = t.TypeOf<typeof YahooTickerDecoder>;
export type YahooTickerSearchResult = t.TypeOf<
  typeof YahooTickerSearchResultDecoder
>;

export type YahooChartData = t.TypeOf<typeof YahooChartDataDecoder>;
export type ChartMeta = YahooChartData["meta"];
export type ChartData = YahooChartData["chart"];
export type ChartDataItem = ArrayItem<ChartData>;

export const intervalForRange = (range: ChartRange): ChartInterval => {
  switch (range) {
    case "1d":
      return "5m";
    case "5d":
      return "15m";
    case "1mo":
      return "1h";
    case "3mo":
    case "6mo":
      return "1d";
    case "1y":
    case "2y":
    case "5y":
    case "ytd":
      return "1d";
    case "10y":
    case "max":
      return "1mo";
  }
};

type TimeFormatter = (ts: ChartDataItem["timestamp"]) => string;
export const tfForRange = (r: ChartRange): TimeFormatter => {
  switch (r) {
    case "1d":
      return (t) => format(t * 1000, "HH:mm");
    case "5d":
      return (t) => format(t * 1000, "cccccc HH:mm");
    case "1mo":
    case "3mo":
      return (t) => format(t * 1000, "d-LLL HH:mm");
    case "6mo":
      return (t) => format(t * 1000, "d-LLL");
    case "1y":
    case "2y":
    case "5y":
    case "10y":
    case "ytd":
    case "max":
      return (t) => format(t * 1000, "d-LLL-yy");
  }
};
