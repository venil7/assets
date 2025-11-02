import { run, type PostTx } from "@darkruby/assets-core";
import { afterAll, beforeAll, expect, test } from "bun:test";
import { pipe } from "fp-ts/lib/function";
import * as A from "fp-ts/lib/ReadonlyArray";
import * as TE from "fp-ts/lib/TaskEither";
import {
  fakeAsset,
  fakeBuy,
  fakePortfolio,
  nonAdminApi,
  type TestApi,
} from "./helper";

let api: TestApi;
beforeAll(async () => {
  api = await run(nonAdminApi());
});
afterAll(async () => {
  await run(api.profile.delete());
});

test("Create asset", async () => {
  const asset = fakeAsset();
  const {
    portfolio,
    asset: { id, portfolio_id, name, ticker, created, modified },
  } = await run(api.createPortfolioAsset(asset));

  expect(id).toBeNumber();
  expect(portfolio_id).toBe(portfolio.id!);
  expect(ticker).toBe(asset.ticker);
  expect(name).toBe(asset.name);
  expect(created).toBeDate();
  expect(modified).toBeDate();
});

test("Get multiple assets", async () => {
  const portfolio = await run(api.portfolio.create(fakePortfolio()));
  const p1 = await run(api.asset.create(portfolio.id!, fakeAsset("MCD")));
  const p2 = await run(api.asset.create(portfolio.id!, fakeAsset("MSFT")));
  const assets = await run(api.asset.getMany(portfolio.id!));
  expect(assets).toSatisfy((a) => Array.isArray(a) && a.length > 0);
});

test("Get single asset", async () => {
  const asset1 = fakeAsset();
  const { portfolio, asset } = await run(api.createPortfolioAsset(asset1));
  const { id, portfolio_id, name, ticker, created, modified } = await run(
    api.asset.get(portfolio.id!, asset.id!)
  );

  expect(id).toBeNumber();
  expect(portfolio_id).toBe(portfolio.id!);
  expect(name).toBe(asset1.name);
  expect(ticker).toBe(asset1.ticker);
  expect(created).toBeDate();
  expect(modified).toBeDate();
});

test("Delete asset", async () => {
  const { portfolio, asset } = await run(api.createPortfolioAsset());
  const { id } = await run(api.asset.delete(portfolio.id!, asset.id!));
  expect(id).toBe(asset.id);
});

test("Asset contributions are correct", async () => {
  const { id } = await run(api.portfolio.create(fakePortfolio()));
  const a1 = await run(api.asset.create(id!, fakeAsset("MCD")));
  const a2 = await run(api.asset.create(id!, fakeAsset("MSFT")));
  const a3 = await run(api.asset.create(id!, fakeAsset("AAPL")));
  const contributions = await run(
    pipe(
      [
        [a1, 10],
        [a2, 30],
        [a3, 60],
      ] as const,
      TE.traverseArray(([asset, quantity]) =>
        api.tx.create(asset.id!, fakeBuy(quantity, 100))
      ),
      TE.chain(TE.traverseArray((t) => api.asset.get(id!, t.asset_id!))),
      TE.map(A.map((a) => a.portfolio_contribution))
    )
  );
  expect(contributions).toEqual([0.1, 0.3, 0.6]);
});

test("Calculate holding, invested and avg_price", async () => {
  const { id: portfolioId } = await run(api.portfolio.create(fakePortfolio()));
  const { id: assetId } = await run(
    api.asset.create(portfolioId!, fakeAsset())
  );

  const txs: PostTx[] = [fakeBuy(10, 100), fakeBuy(20, 110), fakeBuy(30, 130)];
  for (const tx of txs) {
    await run(api.tx.create(assetId!, tx));
  }
  const { invested, holdings, avg_price } = await run(
    api.asset.get(portfolioId!, assetId!)
  );

  const actualHoldings = pipe(
    txs,
    A.map(({ quantity }) => quantity),
    A.reduce(0, (a, b) => a + b)
  );
  const actualInvested = pipe(
    txs,
    A.map(({ quantity, price }) => quantity * price),
    A.reduce(0, (a, b) => a + b)
  );

  expect(holdings).toBe(actualHoldings);
  expect(invested).toBe(actualInvested);
  expect(avg_price).toBe(actualInvested / actualHoldings);
});

test("Update asset", async () => {
  const { portfolio, asset } = await run(api.createPortfolioAsset());

  const updateAsset = fakeAsset();
  const {
    id: newId,
    name,
    ticker,
  } = await run(api.asset.update(asset.id!, portfolio.id!, updateAsset));

  expect(newId).toBe(asset.id);
  expect(name).toBe(updateAsset.name);
  expect(ticker).toBe(updateAsset.ticker);
});
