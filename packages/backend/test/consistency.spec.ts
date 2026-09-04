import { run, TxTypes, type PostTx } from "@darkruby/assets-core";
import { afterAll, beforeAll, expect, test } from "bun:test";
import * as E from "fp-ts/lib/Either";
import {
  D,
  fakeAsset,
  fakePortfolio,
  nonAdminApi,
  type TestApi
} from "./helper";

let api: TestApi;
beforeAll(async () => {
  api = await run(nonAdminApi());
});
afterAll(async () => {
  await run(api.profile.delete());
});

const buy = (qty: number, price: number, date: Date): PostTx => ({
  type: TxTypes.buy,
  quantity: qty,
  price,
  date,
  comments: ""
});

test("moving an asset keeps its transactions", async () => {
  const { portfolio: p1, asset } = await run(
    api.createPortfolioAssetTx(buy(10, 100, D("2023-01-01")))
  );
  const p2 = await run(api.portfolio.create(fakePortfolio()));

  const { id } = await run(api.asset.move(p1.id, asset.id, p2.id));
  expect(id).toBe(asset.id);

  const txs = await run(api.tx.getMany(p2.id, asset.id));
  expect(txs).toHaveLength(1);
  expect(txs[0].running_holding).toBe(10);

  const moved = await run(api.asset.get(p2.id, asset.id));
  expect(moved.holdings).toBe(10);
  expect(moved.invested).toBe(1000);
});

test("deleting a portfolio cascades to its assets and transactions", async () => {
  const { portfolio, asset } = await run(
    api.createPortfolioAssetTx(buy(10, 100, D("2023-01-01")))
  );
  const { id } = await run(api.portfolio.delete(portfolio.id));
  expect(id).toBe(portfolio.id);

  const getAsset = await api.asset.get(portfolio.id, asset.id)();
  expect(E.isLeft(getAsset)).toBe(true);

  const txs = await run(api.tx.getMany(portfolio.id, asset.id));
  expect(txs).toHaveLength(0);
});

test("deleting an asset cascades to its transactions", async () => {
  const { portfolio, asset } = await run(
    api.createPortfolioAssetTx(buy(10, 100, D("2023-01-01")))
  );
  const { id } = await run(api.asset.delete(portfolio.id, asset.id));
  expect(id).toBe(asset.id);

  const txs = await run(api.tx.getMany(portfolio.id, asset.id));
  expect(txs).toHaveLength(0);
  const getAsset = await api.asset.get(portfolio.id, asset.id)();
  expect(E.isLeft(getAsset)).toBe(true);
});

test("num_assets reflects the current asset count", async () => {
  const portfolio = await run(api.portfolio.create(fakePortfolio()));
  await run(api.asset.create(portfolio.id, fakeAsset("msft")));
  await run(api.asset.create(portfolio.id, fakeAsset("aapl")));
  await run(api.asset.create(portfolio.id, fakeAsset("mcd")));

  let p = await run(api.portfolio.get(portfolio.id));
  expect(p.num_assets).toBe(3);

  const assets = await run(api.asset.getMany(portfolio.id));
  await run(api.asset.delete(portfolio.id, assets[0].id));

  p = await run(api.portfolio.get(portfolio.id));
  expect(p.num_assets).toBe(2);
});

test("portfolio invested grows with buys and shrinks with sells", async () => {
  const { portfolio, asset } = await run(
    api.createPortfolioAssetTx(buy(10, 100, D("2023-01-01")))
  );
  await run(
    api.tx.create(portfolio.id, asset.id, buy(10, 50, D("2023-02-01")))
  );
  const a = await run(api.asset.get(portfolio.id, asset.id));
  expect(a.holdings).toBe(20);
  expect(a.invested).toBe(1500);
  expect(a.num_txs).toBe(2);
  expect(a.realized_pnl).toBe(0);
});
