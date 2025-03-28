import type { AppError, PostTransaction } from "@darkruby/assets-core";
import { run } from "@darkruby/assets-core";
import { beforeAll, expect, test } from "bun:test";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { fakeBuy, fakeSell, nonAdminApi, type TestApi } from "./helper";

let api: TestApi;
beforeAll(async () => {
  api = await run(nonAdminApi());
});

const buyTx: PostTransaction = fakeBuy(10, 100);

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
  expect(date).toBeDate();
  expect(created).toBeDate();
  expect(modified).toBeDate();
});

test("Get multiple transactions", async () => {
  const { txs, asset } = await run(
    api.createPortfolioAssetTxs([buyTx, buyTx, buyTx])
  );
  const transactions = await run(api.tx.getMany(asset.id!));
  expect(transactions).toSatisfy(
    (a) => Array.isArray(a) && a.length == txs.length
  );
});

test("Get single transaction", async () => {
  const { tx, asset } = await run(api.createPortfolioAssetTx(buyTx));
  const { id, asset_id, type, quantity, price, date, created, modified } =
    await run(api.tx.get(asset.id!, tx.id!));
  expect(id).toBeNumber();
  expect(asset_id).toBe(asset.id!);
  expect(type).toBeString();
  expect(quantity).toBeNumber();
  expect(price).toBeNumber();
  expect(date).toBeDate();
  expect(created).toBeDate();
  expect(modified).toBeDate();
});

test("Delete transaction", async () => {
  const { tx, asset } = await run(api.createPortfolioAssetTx(buyTx));
  const { id } = await run(api.tx.delete(asset.id!, tx.id!));
  expect(tx.id).toBe(id);
});

test("Update but tx", async () => {
  const { asset, tx } = await run(api.createPortfolioAssetTx(fakeBuy()));

  const updateTx = fakeBuy();
  const {
    id: newId,
    type,
    quantity,
    price,
  } = await run(api.tx.update(tx.id!, asset.id!, updateTx));

  expect(newId).toBe(tx.id);
  expect(type).toBe(updateTx.type);
  expect(quantity).toBe(updateTx.quantity);
  expect(price).toBe(updateTx.price);
});

test("Insufficient holdings when selling more than own", async () => {
  const { asset } = await run(api.createPortfolioAssetTx(buyTx));
  const error = await pipe(
    api.tx.create(asset.id!, fakeSell(11, 1)),
    TE.orElseW((x) => TE.of(x)),
    run
  );
  expect((error as AppError).message).toContain("Insufficient holdings");
});

test("Insufficient holdings when updating existing transaction", async () => {
  const { asset, tx } = await run(api.createPortfolioAssetTx(buyTx));
  const error = await pipe(
    api.tx.update(tx.id!, asset.id!, fakeSell(11, 1)),
    TE.orElseW((x) => TE.of(x)),
    run
  );
  expect((error as AppError).message).toContain("Insufficient holdings");
});
