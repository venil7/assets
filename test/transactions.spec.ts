import { beforeAll, expect, test } from "bun:test";
import { formatISO, startOfDay } from "date-fns";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import type { Transaction } from "../client/api";
import { run, testApi, type TestApi } from "./helper";

var api: TestApi;
beforeAll(async () => {
  api = await run(testApi());
});

const buyTx: Transaction = {
  type: "buy",
  quantity: 10,
  price: 100,
  date: formatISO(new Date(), { representation: "date" }),
};

test("Create transaction", async () => {
  const {
    tx: { id, asset_id, type, quantity, price, date, created, modified },
    asset,
  } = await run(api.createPortfolioAssetTx(buyTx));
  expect(id).toBeNumber();
  expect(asset_id).toBe(asset.id!);
  expect(type).toBe("buy");
  expect(quantity).toBe(10);
  expect(price).toBe(100);
  expect(date).toBe(
    formatISO(startOfDay(new Date()), { representation: "complete" })
  );
  expect(created).toBeString();
  expect(modified).toBeString();
});

test("Get multiple transactions", async () => {
  const { txs, asset } = await run(
    api.createPortfolioAssetTxs([buyTx, buyTx, buyTx])
  );
  const transactions = await run(api.getTxs(asset.id!));
  expect(transactions).toSatisfy(
    (a) => Array.isArray(a) && a.length == txs.length
  );
});

test("Get single transaction", async () => {
  const { tx, asset } = await run(api.createPortfolioAssetTx(buyTx));
  const { id, asset_id, type, quantity, price, date, created, modified } =
    await run(api.getTx(asset.id!, tx.id!));
  expect(id).toBeNumber();
  expect(asset_id).toBe(asset.id!);
  expect(type).toBeString();
  expect(quantity).toBeNumber();
  expect(price).toBeNumber();
  expect(date).toBeString();
  expect(created).toBeString();
  expect(modified).toBeString();
});

test("Delete transaction", async () => {
  const { tx, asset } = await run(api.createPortfolioAssetTx(buyTx));
  const deleted = await run(api.deleteTx(asset.id!, tx.id!));
  expect(deleted).toBeTrue();
});

test("Insufficient holdings when selling more than own", async () => {
  const { asset } = await run(api.createPortfolioAssetTx(buyTx));
  const error = await pipe(
    api.createTx(asset.id!, "sell", 11, 1),
    TE.orElseW((x) => TE.of(x)),
    run
  );
  expect(error).toBe("failed to insert transaction: Insufficient holdings");
});
