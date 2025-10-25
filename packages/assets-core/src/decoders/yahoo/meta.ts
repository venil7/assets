import * as A from "fp-ts/lib/Array";
import { fromCompare, type Ord } from "fp-ts/lib/Ord";
import { pipe } from "fp-ts/lib/function";
import { Ord as NumOrd } from "fp-ts/lib/number";
import * as t from "io-ts";
import { nullableDecoder } from "../util";

const TradingPeriodDecoder = t.type({
  timezone: t.string,
  end: t.number,
  start: t.number,
  gmtoffset: t.number,
});

const CurrentTradingPeriodDecoder = t.type({
  pre: nullableDecoder(TradingPeriodDecoder),
  regular: nullableDecoder(TradingPeriodDecoder),
  post: nullableDecoder(TradingPeriodDecoder),
});

const tradingPeriods = t.array(t.array(TradingPeriodDecoder));

const intervals = [
  "1m",
  "2m",
  "3m",
  "5m",
  "15m",
  "30m",
  "60m",
  "90m",
  "1h",
  "1d",
  "5d",
  "1wk",
  "1mo",
  "3mo",
] as const;
export type ChartInterval = (typeof intervals)[number];

const ranges = [
  "1d",
  "5d",
  "1mo",
  "3mo",
  "6mo",
  "1y",
  "2y",
  "5y",
  "10y",
  "ytd",
  "max",
] as const;
export type ChartRange = (typeof ranges)[number];

export const DEFAULT_CHART_RANGE: ChartRange = "1d";

export const ChartRangeOrd: Ord<ChartRange> = fromCompare((a, b) =>
  NumOrd.compare(
    ranges.findIndex((r) => r === a),
    ranges.findIndex((r) => r === b)
  )
);

export const RangeDecoder = pipe(
  ranges as unknown as string[],
  A.map((v: string) => t.literal(v) as t.LiteralC<string>),
  (codecs) =>
    t.union(
      codecs as [
        t.LiteralC<string>,
        t.LiteralC<string>,
        ...t.LiteralC<string>[],
      ]
    )
) as t.Type<ChartRange>;

export const ChartMetaDecoder = t.type({
  currency: t.string,
  symbol: t.string,
  exchangeName: t.string,
  fullExchangeName: t.string,
  instrumentType: t.string,
  regularMarketTime: t.number,
  regularMarketPrice: t.number,
  fiftyTwoWeekHigh: t.number,
  fiftyTwoWeekLow: t.number,
  shortName: t.string,
  longName: nullableDecoder(t.string),
  previousClose: nullableDecoder(t.number),
  chartPreviousClose: t.number,
  scale: nullableDecoder(t.number),
  currentTradingPeriod: nullableDecoder(CurrentTradingPeriodDecoder),
  tradingPeriods: nullableDecoder(tradingPeriods),
  dataGranularity: t.string,
  validRanges: t.array(RangeDecoder),
  range: RangeDecoder,
});
