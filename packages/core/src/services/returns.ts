import type { NonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import {
  col,
  DataFrame,
  Datetime,
  Float64,
  Int32,
  Int64,
  lit,
  readRecords
} from "nodejs-polars";
import type { GetTx, UnixDate } from "../domain";
import { unixNow } from "../utils/date";

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

const consolidateTxs = <TX extends GetTx>(
  txs: TX[],
  periodStartTimestamp: UnixDate,
  periodStartPrice: number
): DataFrame<{ ts: Int64; price: Float64; qty: Float64 }> => {
  const TXs = readRecords(txs, { schema: TxSchema }).select(
    col("date").cast(Int64).alias("ts"),
    col("price").cast(Float64),
    col("quantity_ext").cast(Float64).alias("qty")
  );
  const before = TXs.filter(col("ts").lessThanEquals(periodStartTimestamp))
    .select(
      lit(periodStartTimestamp).alias("ts").cast(Int64),
      lit(periodStartPrice).alias("price").cast(Float64),
      col("qty").sum()
    )
    .tail(1);
  const after = TXs.filter(col("ts").greaterThan(periodStartTimestamp));
  return before.vstack(after);
};

export const calculateReturns = <TX extends GetTx>(
  txs: NonEmptyArray<TX>,
  periodStartTimestamp: UnixDate,
  periodStartPrice: number,
  marketPrice: number
) => {
  let TXs = consolidateTxs(txs, periodStartTimestamp, periodStartPrice);
  TXs = TXs.withColumns(
    col("ts").alias("ts_start"),
    col("ts").shift(-1).alias("ts_end").fillNull(unixNow()),
    col("price").alias("price_start"),
    col("price").shift(-1).fillNull(marketPrice).alias("price_end"),
    col("qty").cumSum().alias("running_holding"),
    col("qty").multiplyBy(col("price")).alias("cost")
  ).withColumns(
    col("running_holding").shift(1).fillNull(0).alias("holding_before"),
    col("price_end").divideBy(col("price_start")).alias("growth_factor"),
    col("running_holding").multiplyBy(col("price_end")).alias("running_value"),
    col("cost").cumSum().alias("running_cost")
  );

  const returns = TXs.select(
    col("growth_factor").cumProd().last().minus(1).alias("twr"),
    col("running_value").last().alias("final_value"),
    col("cost").sum().alias("final_cost"),
    col("holding_before")
      .first()
      .multiplyBy(col("price_start").first())
      .alias("start_value")
  )
    .withColumns(
      col("final_value")
        .minus(col("start_value"))
        .minus(col("final_cost"))
        .alias("dollar_return")
    )
    .withColumns(col("dollar_return").divideBy(col("final_cost")).alias("mwr"));

  return returns.toRecords()[0];
};
