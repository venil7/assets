import { test } from "bun:test";
import { fromUnixTime } from "date-fns";
import * as A from "fp-ts/lib/Array";
import type { NonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import type { YahooChartData } from "../src/domain";
import type { GetTx } from "../src/domain/tx";
import { timeWeightedReturns } from "../src/services/returns";

// test.only("dataframe", () => {
//   type A = { a: number; b: string; c: Date };
//   const as = [
//     { a: 1, b: "1", c: fromUnixTime(1) },
//     { a: 2, b: "2", c: fromUnixTime(2) },
//     { a: 3, b: "3", c: fromUnixTime(3) },
//     { a: 4, b: "4", c: fromUnixTime(4) }
//   ];
//   const df = readRecords(as, { schema: { a: Int16, b: Str, c: Datetime() } });
//   const agg = df.select(
//     col("a").cumProd().last().alias("a_prod"),
//     col("a").sum().alias("a_sum")
//   );
//   console.log(agg.toRecords()[0]);
// });

test.only("TWR calculation", () => {
  const txs = [
    { id: 1, quantity_ext: 1, price: 100, date: fromUnixTime(3) },
    { id: 2, quantity_ext: 2, price: 110, date: fromUnixTime(5) },
    { id: 3, quantity_ext: 3, price: 120, date: fromUnixTime(7) }
  ] as unknown as NonEmptyArray<GetTx>;
  const quotes = A.makeBy(10, (i) => ({
    price: 100 + i * 2,
    timestamp: i
  }));
  const chart = {
    meta: { regularMarketTime: 10, regularMarketPrice: 120 },
    chart: quotes
  } as unknown as YahooChartData;
  const res = timeWeightedReturns(txs, chart);
  console.log(res);
});
