import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import type { NonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import * as O from "fp-ts/lib/Option";
import * as t from "io-ts";
import { changeInValue, changeInValuePct } from "../../utils/finance";
import {
  dateDecoder,
  mapDecoder,
  nullableDecoder,
  validationErr,
} from "../util";
import { ChartMetaDecoder } from "./meta";
import type { PeriodPriceDecoder } from "./period";

const QuoteDecoder = t.type({
  open: t.array(nullableDecoder(t.number)),
  low: t.array(nullableDecoder(t.number)),
  high: t.array(nullableDecoder(t.number)),
  close: t.array(nullableDecoder(t.number)),
  volume: t.array(nullableDecoder(t.number)),
});

const IndicatorsDecoder = t.type({
  quote: t.array(QuoteDecoder),
});

export const ChartDecoder = t.type({
  meta: ChartMetaDecoder,
  timestamp: t.array(t.number),
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

type ChartDataPoint = t.TypeOf<typeof ChartDataPointDecoder>;

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
    price: t.TypeOf<typeof PeriodPriceDecoder>;
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
          price: meta.previousClose,
          volume: 0,
          timestamp: timestamp[0] - 5 * 60,
        };
        const res = {
          meta,
          chart: [
            prevClose,
            ...combineIndicators(timestamp, indicators.quote[0]),
          ] as NonEmptyArray<ChartDataPoint>,
        };
        return E.of(res);
      }
      return E.left([validationErr(`chart contains no data`)]);
    }),
    E.bind("latest", ({ chart }) => {
      const { timestamp, price } = pipe(
        chart.chart,
        A.findLast((x) => x.price !== null),
        O.getOrElseW(() => ({
          price: chart.meta.previousClose,
          timestamp: 0,
        }))
      );
      return pipe(
        dateDecoder.decode(timestamp),
        E.map((lastUpdated) => ({ lastUpdated, periodEndPrice: price }))
      );
    }),
    E.map(
      ({
        chart: { meta, chart },
        latest: { lastUpdated, periodEndPrice },
      }) => ({
        meta,
        chart,
        price: {
          lastUpdated,
          periodEndPrice,
          periodStartPrice: meta.previousClose,
          periodChangePct: changeInValuePct(meta.previousClose)(periodEndPrice),
          periodChange: changeInValue(meta.previousClose)(periodEndPrice),
        },
      })
    )
  );
});
