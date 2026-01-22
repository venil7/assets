import {
  addDays,
  addMonths,
  addSeconds,
  addYears,
  endOfToday,
  format,
  fromUnixTime,
  getUnixTime,
  startOfToday,
  startOfYear,
  sub
} from "date-fns";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import type { YahooChartDataDecoder } from "../decoders/yahoo/chart";
import type { ChartInterval, ChartRange } from "../decoders/yahoo/meta";
import type {
  PeriodChangesDecoder,
  TotalsDecoder,
  UnixDateDecoder
} from "../decoders/yahoo/period";
import type {
  YahooTickerDecoder,
  YahooTickerSearchResultDecoder
} from "../decoders/yahoo/ticker";
import { fuzzyIndexSearch } from "../utils/array";
import { now } from "../utils/date";
import type { ArrayItem, Optional } from "../utils/utils";
import { EARLIEST_DATE } from "./tx";

export type YahooTicker = t.TypeOf<typeof YahooTickerDecoder>;
export type YahooTickerSearchResult = t.TypeOf<
  typeof YahooTickerSearchResultDecoder
>;

export type PeriodChanges = t.TypeOf<typeof PeriodChangesDecoder>;
export type Totals = t.TypeOf<typeof TotalsDecoder>;

export type YahooChartData = t.TypeOf<typeof YahooChartDataDecoder>;
export type ChartMeta = YahooChartData["meta"];
export type ChartData = YahooChartData["chart"];
export type ChartDataItem = ArrayItem<ChartData>;
export type UnixDate = t.TypeOf<typeof UnixDateDecoder>;

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
  const pattern = (() => {
    switch (r) {
      case "1d":
      case "5d":
        return "cccccc HH:mm";
      case "1mo":
        return "d LLL HH:mm";
      case "3mo":
      case "6mo":
        return "d LLL";
      case "1y":
      case "2y":
      case "5y":
      case "10y":
      case "ytd":
      case "max":
        return "d-LLL-yy";
    }
  })();
  return (t) => format(fromUnixTime(t), pattern);
};

export const ealiest = (range: ChartRange): Date => {
  switch (range) {
    case "1d":
      return sub(startOfToday(), { days: 1 });
    case "5d":
      return sub(startOfToday(), { days: 5 });
    case "1mo":
      return sub(startOfToday(), { months: 1 });
    case "3mo":
      return sub(startOfToday(), { months: 3 });
    case "6mo":
      return sub(startOfToday(), { months: 6 });
    case "1y":
      return sub(startOfToday(), { years: 1 });
    case "2y":
      return sub(startOfToday(), { years: 2 });
    case "5y":
      return sub(startOfToday(), { years: 5 });
    case "5y":
      return sub(startOfToday(), { years: 5 });
    case "10y":
      return sub(startOfToday(), { years: 10 });
    case "ytd":
      return startOfYear(endOfToday());
    case "max":
    default:
      return EARLIEST_DATE;
  }
};

export const rangeForDate = (date: Date): ChartRange => {
  const today = now();
  switch (true) {
    case date >= today:
      return "1d";
    case date < addYears(today, -10):
      return "max";
    case date < addYears(today, -5):
      return "10y";
    case date < addYears(today, -2):
      return "5y";
    case date < addYears(today, -1):
      return "2y";
    case date < addMonths(today, -6):
      return "1y";
    case date < addMonths(today, -3):
      return "6mo";
    case date < addMonths(today, -1):
      return "3mo";
    case date < addDays(today, -5):
      return "1mo";
    case date < addDays(today, -1):
      return "5d";
    case date < addSeconds(today, -1):
      return "1d";
    default:
      return "max";
  }
};

export const priceForDate = (
  data: YahooChartData,
  date: Optional<Date>
): number => {
  // if no date supplied return Market price
  if (!date) return data.meta.regularMarketPrice;
  // else return best price approximation
  const idx = pipe(
    data.chart,
    fuzzyIndexSearch<ChartDataItem>(getUnixTime(date), (item) => item.timestamp)
  );
  return data.chart[idx].price;
};

export const getToBase = (baseRate: number) => (n: number) => n / baseRate;
