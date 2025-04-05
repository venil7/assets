import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { nullableDecoder } from "../util";

const TradingPeriodDecoder = t.type({
  timezone: t.string,
  end: t.number,
  start: t.number,
  gmtoffset: t.number,
});

const CurrentTradingPeriodDecoder = t.type({
  pre: TradingPeriodDecoder,
  regular: TradingPeriodDecoder,
  post: TradingPeriodDecoder,
});

const tradingPeriods = t.array(t.array(TradingPeriodDecoder));

export const Range = pipe(
  ["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "ytd", "max"],
  A.map((v: string) => t.literal(v) as t.Mixed),
  (codecs) => t.union(codecs as [t.Mixed, t.Mixed, ...t.Mixed[]])
);

export const ChartMetaDecoder = t.type({
  currency: t.string,
  symbol: t.string,
  exchangeName: t.string,
  fullExchangeName: t.string,
  instrumentType: t.string,
  regularMarketTime: t.number,
  // firstTradeDate: t.number,
  // hasPrePostMarketData: t.boolean,
  // gmtoffset: t.number,
  // timezone: t.string,
  // exchangeTimezoneName: t.string,
  regularMarketPrice: t.number,
  fiftyTwoWeekHigh: t.number,
  fiftyTwoWeekLow: t.number,
  // regularMarketDayHigh: t.number,
  // regularMarketDayLow: t.number,
  // regularMarketVolume: t.number,
  longName: t.string,
  shortName: t.string,
  previousClose: nullableDecoder(t.number),
  chartPreviousClose: t.number,
  scale: nullableDecoder(t.number),
  // priceHint: t.number,
  // currentTradingPeriod: CurrentTradingPeriodDecoder,
  tradingPeriods: nullableDecoder(tradingPeriods),
  dataGranularity: t.string,
  range: Range,
  validRanges: t.array(Range),
});
