import { test } from "bun:test";
import { fromUnixTime } from "date-fns";
import * as A from "fp-ts/lib/Array";
import type { NonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import type { YahooChartData } from "../src/domain";
import type { GetTx } from "../src/domain/tx";
import { timeWeightedReturns } from "../src/services/returns";

test("TWR calculation", () => {
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
