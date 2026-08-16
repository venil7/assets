import { run } from "@darkruby/assets-core";
import { afterAll, beforeAll, expect, test } from "bun:test";
import * as E from "fp-ts/lib/Either";
import { fakeBuy, fakePortfolio, nonAdminApi, type TestApi } from "./helper";

let apiA: TestApi;
let apiB: TestApi;

beforeAll(async () => {
  apiA = await run(nonAdminApi());
  apiB = await run(nonAdminApi());
});

afterAll(async () => {
  await run(apiA.profile.delete()).catch(() => undefined);
  await run(apiB.profile.delete()).catch(() => undefined);
});

test("user B cannot read user A's portfolio or assets", async () => {
  const { portfolio, asset } = await run(apiA.createPortfolioAsset());

  const getPortfolio = await apiB.portfolio.get(portfolio.id)();
  expect(E.isLeft(getPortfolio)).toBe(true);

  const getAsset = await apiB.asset.get(portfolio.id, asset.id)();
  expect(E.isLeft(getAsset)).toBe(true);

  const assets = await run(apiB.asset.getMany(portfolio.id));
  expect(assets).toHaveLength(0);
});

test("user B cannot delete user A's portfolio", async () => {
  const portfolio = await run(apiA.portfolio.create(fakePortfolio()));

  const res = await apiB.portfolio.delete(portfolio.id)();
  expect(E.isLeft(res)).toBe(true);

  const stillThere = await run(apiA.portfolio.get(portfolio.id));
  expect(stillThere.id).toBe(portfolio.id);
});

test("user B cannot see user A's transactions", async () => {
  const { portfolio, asset, tx } = await run(
    apiA.createPortfolioAssetTx(fakeBuy(10, 100))
  );

  const txs = await run(apiB.tx.getMany(portfolio.id, asset.id));
  expect(txs).toHaveLength(0);

  const one = await apiB.tx.get(portfolio.id, asset.id, tx.id)();
  expect(E.isLeft(one)).toBe(true);
});

test("user A keeps full access to their own data", async () => {
  const { portfolio, asset } = await run(
    apiA.createPortfolioAssetTx(fakeBuy(10, 100))
  );

  const p = await run(apiA.portfolio.get(portfolio.id));
  expect(p.id).toBe(portfolio.id);

  const a = await run(apiA.asset.get(portfolio.id, asset.id));
  expect(a.holdings).toBe(10);

  const txs = await run(apiA.tx.getMany(portfolio.id, asset.id));
  expect(txs).toHaveLength(1);
});
