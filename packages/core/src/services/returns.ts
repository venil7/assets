import { fromUnixTime } from "date-fns";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import type { NonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import { col, Datetime, Float64, Int32, readRecords } from "nodejs-polars";
import type { ChartDataItem, GetTx, YahooChartData } from "../domain";

const TxSchema = {
  id: Int32,
  quantity_ext: Float64,
  price: Float64,
  date: Datetime()
};
const QuoteSchema = {
  price: Float64,
  date: Datetime()
};

const toQuote = ({ price, timestamp }: ChartDataItem) => ({
  price,
  date: fromUnixTime(timestamp)
});

export const timeWeightedReturns = <TX extends GetTx>(
  txs: NonEmptyArray<TX>,
  chart: YahooChartData
) => {
  const lastTx = txs[txs.length - 1];
  const lastSubperiodEnd: TX = {
    ...lastTx,
    id: lastTx.id + 1,
    quantity: 0,
    quantity_ext: 0,
    date: fromUnixTime(chart.meta.regularMarketTime),
    price: chart.meta.regularMarketPrice
  };
  const quotes = pipe(chart.chart, A.map(toQuote));
  const TXs = readRecords([...txs, lastSubperiodEnd], { schema: TxSchema });
  const Qs = readRecords(quotes, { schema: QuoteSchema });

  (() => {
    const twr = Qs.joinAsof(TXs, {
      on: "date",
      strategy: "backward",
      suffix: ".tx"
    }).sort("id");
    console.log(twr);
  })();

  const twr = Qs.joinAsof(TXs, {
    on: "date",
    strategy: "backward",
    suffix: ".tx"
  })
    .sort("id")
    .groupBy("id")
    .agg(
      col("date").first().alias("date_start"),
      col("date").last().alias("date_end"),
      col("price").first().alias("price_start"),
      col("price").last().alias("price_end"),
      col("quantity_ext").mode().first().fillNan(0).alias("qty")
    )
    .withColumns(
      col("price_end").minus(col("price_start")).alias("price_diff"),
      col("qty")
        .rollingSum({ windowSize: Number.MAX_SAFE_INTEGER, minPeriods: 1 })
        .alias("acc_qty")
    )
    .withColumns(
      col("price_diff").divideBy(col("price_start")).alias("returnPct"),
      col("price_diff").multiplyBy(col("acc_qty")).alias("returnValue")
    )
    .filter(col("id").isNotNull())
    .select(
      col("returnPct").plus(1).cumProd().last().minus(1), // TWR
      col("returnValue").sum()
    );
  return twr.toRecords()[0];
};
