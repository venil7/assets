import type { AppError, PostTx } from "@darkruby/assets-core";
import { defaultTxsUpload, run } from "@darkruby/assets-core";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import { afterAll, beforeAll, expect, test } from "bun:test";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { CsvPostTxDecoder } from "../src/decoders/tx";
import { fakeBuy, fakeSell, nonAdminApi, type TestApi } from "./helper";

let api: TestApi;
beforeAll(async () => {
  api = await run(nonAdminApi());
});
afterAll(async () => {
  await run(api.profile.delete());
});

const buyTx: PostTx = fakeBuy(10, 100);

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

test("Update buy tx", async () => {
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
    TE.orElseW(TE.of),
    run
  );
  expect((error as AppError).message).toContain("Insufficient holdings");
});

test("Insufficient holdings when updating existing transaction", async () => {
  const { asset, tx } = await run(api.createPortfolioAssetTx(buyTx));
  const error = await pipe(
    api.tx.update(tx.id!, asset.id!, fakeSell(11, 1)),
    TE.orElseW(TE.of),
    run
  );
  expect((error as AppError).message).toContain("Insufficient holdings");
});

test("CSV roundtrip", async () => {
  const txs = [fakeBuy(), fakeSell()];
  const csv = CsvPostTxDecoder.encode(txs);
  const txs2 = await pipe(csv, liftTE(CsvPostTxDecoder), run);
  expect(txs2).toEqual(txs);
});

test("Delete all txs of an asset", async () => {
  const txs = [fakeBuy(), fakeBuy(), fakeBuy(), fakeBuy()];
  const { asset } = await run(api.createPortfolioAssetTxs(txs));
  const res = await run(api.tx.deleteAllAsset(asset.id));
  expect(res.id).toEqual(txs.length);
  const allTxs = await run(api.tx.getMany(asset.id));
  expect(allTxs.length).toEqual(0);
});

test("Bulk upload with replace", async () => {
  const txs = [fakeBuy(), fakeBuy(), fakeBuy(), fakeBuy()];
  const additionalTxs = [fakeBuy(), fakeBuy()];
  const { asset } = await run(api.createPortfolioAssetTxs(txs));
  const newTxs = await run(
    api.tx.uploadAsset(asset.id, defaultTxsUpload(additionalTxs, true))
  );
  expect(newTxs.length).toEqual(additionalTxs.length);
});

test("Bulk upload with no replace", async () => {
  const txs = [fakeBuy(), fakeBuy(), fakeBuy(), fakeBuy()];
  const additionalTxs = [fakeBuy(), fakeBuy()];
  const { asset } = await run(api.createPortfolioAssetTxs(txs));
  const newTxs = await run(
    api.tx.uploadAsset(asset.id, defaultTxsUpload(additionalTxs, false))
  );
  expect(newTxs.length).toEqual(txs.length + additionalTxs.length);
});
