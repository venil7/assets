import { expect, test } from "bun:test";
import { fromUnixTime } from "date-fns";
import type { NonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import type { UnixDate } from "../src/domain";
import type { GetTx } from "../src/domain/tx";
import { calculateReturns } from "../src/services/returns";

// test.only("df extend test", () => {
//   console.log("---------->>>test");
//   const df1 = readRecords([
//     { a: 1, b: "x" },
//     { a: 2, b: "y" }
//   ]);

//   const res = df1.extend(df1);
//   console.log(res.toString());
// });

test("TWR calculation (as per twr.ipynb)", () => {
  const txs = [
    { date: fromUnixTime(1), price: 102, quantity_ext: 2 },
    { date: fromUnixTime(3), price: 105, quantity_ext: 5 },
    { date: fromUnixTime(4), price: 105.5, quantity_ext: -6 },
    { date: fromUnixTime(5), price: 106.5, quantity_ext: 3 },
    { date: fromUnixTime(7), price: 108, quantity_ext: 1 }
  ] as unknown as NonEmptyArray<GetTx>;

  const marketPrice = 110;
  const periodStartTs = 0 as UnixDate;
  const periodStartPrice = 101;

  const { twr, mwr, start_value, final_value, final_cost, dollar_return } =
    calculateReturns(txs, periodStartTs, periodStartPrice, marketPrice);

  expect(twr).toBe(0.08910891089108897);
  expect(mwr).toBe(0.050620821394460364);
  expect(start_value).toBe(0);
  expect(final_value).toBe(550);
  expect(final_cost).toBe(523.5);
  expect(dollar_return).toBe(26.5);
});
