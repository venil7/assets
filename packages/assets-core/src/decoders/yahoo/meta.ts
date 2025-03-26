import * as t from "io-ts";

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

export const ChartMetaDecoder = t.type({
  currency: t.string,
  symbol: t.string,
  exchangeName: t.string,
  fullExchangeName: t.string,
  instrumentType: t.string,
  firstTradeDate: t.number,
  regularMarketTime: t.number,
  hasPrePostMarketData: t.boolean,
  gmtoffset: t.number,
  timezone: t.string,
  exchangeTimezoneName: t.string,
  regularMarketPrice: t.number,
  fiftyTwoWeekHigh: t.number,
  fiftyTwoWeekLow: t.number,
  regularMarketDayHigh: t.number,
  regularMarketDayLow: t.number,
  regularMarketVolume: t.number,
  longName: t.string,
  shortName: t.string,
  chartPreviousClose: t.number,
  previousClose: t.number,
  scale: t.number,
  priceHint: t.number,
  currentTradingPeriod: CurrentTradingPeriodDecoder,
  tradingPeriods: tradingPeriods,
  dataGranularity: t.string,
  range: t.string,
  validRanges: t.array(t.string),
});
