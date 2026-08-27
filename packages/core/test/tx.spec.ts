import { expect, test } from "bun:test";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import {
  TxTypes,
  byDateAsc,
  byDateDesc,
  cloneTx,
  defaultBuyTx,
  defaultTxsUpload,
  earliestTxBeforeTimestamp,
  isBuy,
  isSell,
  toKey,
  toKeys,
  txBuy,
  txSell,
  txsAfterTimestamp,
  type GetTx,
  type PostTx,
  type UnixDate
} from "../src";

const mkTx = (id: number, timestamp: number, running_holding: number): GetTx =>
  ({
    ...defaultBuyTx(),
    id,
    timestamp: timestamp as UnixDate,
    running_holding
  }) as unknown as GetTx;

test("isBuy / isSell / txBuy / txSell", () => {
  expect(isBuy("buy")).toBe(true);
  expect(isBuy("sell")).toBe(false);
  expect(isSell("buy")).toBe(false);
  expect(isSell("sell")).toBe(true);
  expect(txBuy({ type: "buy" })).toBe(true);
  expect(txSell({ type: "buy" })).toBe(false);
  expect(txSell({ type: "sell" })).toBe(true);
});

test("byDateAsc sorts ascending", () => {
  const txs: PostTx[] = [
    { ...defaultBuyTx(), date: new Date(3000) },
    { ...defaultBuyTx(), date: new Date(1000) },
    { ...defaultBuyTx(), date: new Date(2000) }
  ];
  const sorted = pipe(txs, A.sort(byDateAsc));
  expect(sorted.map((t) => t.date.getTime())).toEqual([1000, 2000, 3000]);
});

test("byDateDesc sorts descending", () => {
  const txs: PostTx[] = [
    { ...defaultBuyTx(), date: new Date(3000) },
    { ...defaultBuyTx(), date: new Date(1000) },
    { ...defaultBuyTx(), date: new Date(2000) }
  ];
  const sorted = pipe(txs, A.sort(byDateDesc));
  expect(sorted.map((t) => t.date.getTime())).toEqual([3000, 2000, 1000]);
});

test("earliestTxBeforeTimestamp returns tx at or before ts", () => {
  const txs = [mkTx(1, 100, 5), mkTx(2, 200, 8), mkTx(3, 300, 9)];
  expect(earliestTxBeforeTimestamp(250 as UnixDate)(txs)?.timestamp).toBe(
    200 as UnixDate
  );
  expect(earliestTxBeforeTimestamp(100 as UnixDate)(txs)?.timestamp).toBe(
    100 as UnixDate
  );
  expect(earliestTxBeforeTimestamp(400 as UnixDate)(txs)?.timestamp).toBe(
    300 as UnixDate
  );
});

test("earliestTxBeforeTimestamp returns undefined before first tx or on empty", () => {
  const txs = [mkTx(1, 100, 5)];
  expect(earliestTxBeforeTimestamp(50 as UnixDate)(txs)).toBeUndefined();
  expect(earliestTxBeforeTimestamp(50 as UnixDate)([])).toBeUndefined();
});

test("txsAfterTimestamp returns txs at or after ts", () => {
  const txs = [mkTx(1, 100, 5), mkTx(2, 200, 8), mkTx(3, 300, 9)];
  expect(
    txsAfterTimestamp(250 as UnixDate)(txs).map((t) => t.timestamp)
  ).toEqual([300 as UnixDate]);
  expect(
    txsAfterTimestamp(100 as UnixDate)(txs).map((t) => t.timestamp)
  ).toEqual([100 as UnixDate, 200 as UnixDate, 300 as UnixDate]);
  expect(
    txsAfterTimestamp(50 as UnixDate)(txs).map((t) => t.timestamp)
  ).toEqual([100 as UnixDate, 200 as UnixDate, 300 as UnixDate]);
});

test("txsAfterTimestamp returns empty after last tx or on empty", () => {
  const txs = [mkTx(1, 100, 5)];
  expect(txsAfterTimestamp(400 as UnixDate)(txs)).toEqual([]);
  expect(txsAfterTimestamp(400 as UnixDate)([])).toEqual([]);
});

test("toKey / toKeys encode id + modified", () => {
  const tx = {
    ...defaultBuyTx(),
    id: 5,
    modified: new Date(1234)
  } as unknown as GetTx;
  expect(toKey(tx)).toBe("tx-5-1234");
  const tx2 = {
    ...defaultBuyTx(),
    id: 7,
    modified: new Date(999)
  } as unknown as GetTx;
  expect(toKeys([tx, tx2])).toBe("tx-5-1234-tx-7-999");
});

test("cloneTx refreshes the date but keeps other fields", () => {
  const tx: PostTx = {
    type: TxTypes.buy,
    quantity: 1,
    price: 2,
    date: new Date(1000),
    comments: "note"
  };
  const clone = cloneTx(tx);
  expect(clone).not.toBe(tx);
  expect(clone.date.getTime()).not.toBe(1000);
  expect(clone.quantity).toBe(1);
  expect(clone.price).toBe(2);
  expect(clone.comments).toBe("note");
});

test("defaultTxsUpload", () => {
  expect(defaultTxsUpload()).toEqual({ txs: [], replace: false });
  const txs = [defaultBuyTx()];
  expect(defaultTxsUpload(txs, true)).toEqual({ txs, replace: true });
});
