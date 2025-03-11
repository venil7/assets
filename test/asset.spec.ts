import { beforeAll, expect, test } from "bun:test";
import faker from "faker";
import { pipe } from "fp-ts/lib/function";
import * as A from "fp-ts/lib/ReadonlyArray";
import * as TE from "fp-ts/lib/TaskEither";
import { type Api, api as getApi, type Transaction } from "./api";
import { authenticate, run } from "./index";

var api: Api;
var PORTFOLIO_ID = 0;

beforeAll(async () => {
  const methods = await run(authenticate());
  api = getApi(methods);
  PORTFOLIO_ID = (await run(api.createPortfolio())).id!;
});

test("Create asset", async () => {
  const [assetName, assetTicker] = [faker.lorem.slug(2), faker.lorem.slug(2)];
  const { id, portfolio_id, name, ticker, created, modified } = await run(
    api.createAsset(PORTFOLIO_ID, assetName, assetTicker)
  );
  expect(id).toBeNumber();
  expect(portfolio_id).toBe(PORTFOLIO_ID);
  expect(name).toBe(assetName);
  expect(ticker).toBe(assetTicker);
  expect(created).toBeString();
  expect(modified).toBeString();
});

test("Get multiple assets", async () => {
  const assets = await run(api.getAssets(PORTFOLIO_ID));
  expect(assets).toSatisfy((a) => Array.isArray(a) && a.length > 0);
});

test("Get single asset", async () => {
  const [assetName, assetTicker] = [faker.lorem.slug(2), faker.lorem.slug(2)];
  const { id: assetId } = await run(
    api.createAsset(PORTFOLIO_ID, assetName, assetTicker)
  );
  const { id, portfolio_id, name, ticker, created, modified } = await run(
    api.getAsset(PORTFOLIO_ID, assetId!)
  );
  expect(id).toBeNumber();
  expect(portfolio_id).toBe(PORTFOLIO_ID);
  expect(name).toBe(assetName);
  expect(ticker).toBe(assetTicker);
  expect(created).toBeString();
  expect(modified).toBeString();
});

test("Delete asset", async () => {
  const { id } = await run(api.createAsset(PORTFOLIO_ID));

  const deleted = await run(api.deleteAsset(PORTFOLIO_ID, id!));
  expect(deleted).toBeTrue();
});

test("Asset contributions are correct", async () => {
  const { id } = await run(api.createPortfolio());
  const a1 = await run(api.createAsset(id!));
  const a2 = await run(api.createAsset(id!));
  const a3 = await run(api.createAsset(id!));
  const contributions = await run(
    pipe(
      [
        [a1, 10],
        [a2, 30],
        [a3, 60],
      ] as const,
      TE.traverseArray(([asset, quantity]) =>
        api.createTx(asset.id!, "buy", quantity, 100)
      ),
      TE.chain(TE.traverseArray((t) => api.getAsset(id!, t.asset_id!))),
      TE.map(A.map((a) => a.portfolio_contribution!))
    )
  );
  expect(contributions).toEqual([0.1, 0.3, 0.6]);
});

test("Calculate holding, invested and avg_price", async () => {
  const { id: portfolioId } = await run(api.createPortfolio());
  const { id: assetId } = await run(api.createAsset(portfolioId!));

  const txs: [quantity: number, price: number, type: Transaction["type"]][] = [
    [10, 100, "buy"],
    [20, 110, "buy"],
    [30, 130, "buy"],
  ];
  for (const [quantity, price, type] of txs) {
    await run(api.createTx(assetId!, type, quantity, price));
  }
  const { invested, holdings, avg_price } = await run(
    api.getAsset(portfolioId!, assetId!)
  );

  const actualHoldings = pipe(
    txs,
    A.map(([q]) => q),
    A.reduce(0, (a, b) => a + b)
  );
  const actualInvested = pipe(
    txs,
    A.map(([q, p]) => q * p),
    A.reduce(0, (a, b) => a + b)
  );

  expect(holdings).toBe(actualHoldings);
  expect(invested).toBe(actualInvested);
  expect(avg_price).toBe(actualInvested / actualHoldings);
});
