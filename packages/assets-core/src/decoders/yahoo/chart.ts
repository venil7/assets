import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import type { NonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import * as O from "fp-ts/lib/Option";
import * as t from "io-ts";
import { withFallback } from "io-ts-types";
import { changeInPct, changeInValue } from "../../utils/finance";
import { mapDecoder, nullableDecoder, validationErr } from "../util";
import { ChartMetaDecoder } from "./meta";
import { UnixDateDecoder, type PeriodChangesDecoder } from "./period";

const QuoteDecoder = t.type({
  open: t.array(nullableDecoder(t.number)),
  low: t.array(nullableDecoder(t.number)),
  high: t.array(nullableDecoder(t.number)),
  close: t.array(nullableDecoder(t.number)),
  volume: t.array(nullableDecoder(t.number)),
});

const IndicatorsDecoder = t.type({
  quote: withFallback(t.array(QuoteDecoder), []),
});

export const ChartDecoder = t.type({
  meta: ChartMetaDecoder,
  timestamp: withFallback(t.array(t.number), []), // may not be present
  indicators: IndicatorsDecoder,
});

const RawChartResponseDecoder = t.type({
  chart: t.type({
    result: nullableDecoder(t.array(ChartDecoder)),
    error: nullableDecoder(
      t.type({
        code: t.string,
        description: t.string,
      })
    ),
  }),
});

type RawChartResponse = t.TypeOf<typeof RawChartResponseDecoder>;
type RawChartResult = NonNullable<RawChartResponse["chart"]["result"]>[0];

type ArrayElement<A> = A extends Array<infer E> ? E : never;

type Timestamps = RawChartResult["timestamp"];
type Indicators = ArrayElement<RawChartResult["indicators"]["quote"]>;

const chartDataPointTypes = {
  timestamp: t.number,
  volume: t.number,
  price: t.number,
};

export const ChartDataPointDecoder = t.type(chartDataPointTypes);

export type ChartDataPoint = t.TypeOf<typeof ChartDataPointDecoder>;

const combineIndicators = (
  timestamps: Timestamps,
  { volume, close }: Indicators
): ChartDataPoint[] => {
  return pipe(
    timestamps,
    A.zip(A.zipWith(close, volume, (c, v) => [c, v] as const)),
    A.filterMap(([timestamp, [price, volume]]) =>
      price ? O.some({ timestamp, price, volume: volume ?? 0 }) : O.none
    )
  );
};

export const YahooChartDataDecoder = mapDecoder<
  RawChartResponse,
  {
    meta: t.TypeOf<typeof ChartMetaDecoder>;
    chart: NonEmptyArray<ChartDataPoint>;
    price: t.TypeOf<typeof PeriodChangesDecoder>;
  }
>(RawChartResponseDecoder, ({ chart }) => {
  return pipe(
    E.Do,
    E.bind("chart", () => {
      if (chart.error) {
        const message = `${chart.error?.code} - ${chart.error?.description}`;
        return E.left([validationErr(message, chart.error)]);
      }
      if (chart.result && chart.result.length > 0) {
        const { meta, timestamp, indicators } = chart.result[0];
        const prevClose: ChartDataPoint = {
          price: meta.previousClose ?? meta.chartPreviousClose,
          volume: 0,
          timestamp: timestamp.length
            ? timestamp[0] - 5 * 60
            : meta.regularMarketTime,
        };
        const res = {
          meta,
          chart: [
            prevClose,
            // indicators quote is not always present
            ...(indicators.quote.length
              ? combineIndicators(timestamp, indicators.quote[0])
              : []),
          ] as NonEmptyArray<ChartDataPoint>,
        };
        return E.of(res);
      }
      return E.left([validationErr(`chart contains no data`)]);
    }),
    E.bind("start", ({ chart }) => {
      return withFallback(
        UnixDateDecoder,
        Math.floor(new Date().getTime() / 1000) as t.TypeOf<
          typeof UnixDateDecoder
        >
      ).decode(chart.meta.currentTradingPeriod?.regular?.start);
    }),
    E.bind("end", ({ chart }) => {
      return UnixDateDecoder.decode(chart.meta.regularMarketTime);
    }),
    E.map(({ chart: { meta, chart }, start, end }) => {
      const beginning = meta.previousClose ?? meta.chartPreviousClose;
      return {
        meta,
        chart,
        price: {
          start,
          end,
          beginning,
          current: meta.regularMarketPrice,
          changePct: changeInPct({
            before: beginning,
            after: meta.regularMarketPrice,
          }),
          change: changeInValue({
            before: beginning,
            after: meta.regularMarketPrice,
          }),
        },
      };
    })
  );
});
