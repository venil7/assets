import { run } from "@darkruby/assets-core";
import { beforeAll, expect, test } from "bun:test";
import {
  fakeAsset,
  fakeBuy,
  fakePortfolio,
  type TestApi,
  testApi,
} from "./helper";

let api: TestApi;
beforeAll(async () => {
  api = await run(testApi());
});

test("Create portfolio", async () => {
  const portfolio = fakePortfolio();
  const { id, user_id, name, description, created, modified } = await run(
    api.createPortfolio(portfolio)
  );
  expect(id).toBeNumber();
  expect(user_id).toBeNumber();
  expect(name).toBe(portfolio.name);
  expect(description).toBe(portfolio.description);
  expect(created).toBeDate();
  expect(modified).toBeDate();
});

test("Get multiple portfolios", async () => {
  const portfolios = await run(api.getPortfolios());
  expect(portfolios).toSatisfy((a) => Array.isArray(a) && a.length > 0);
});

test("Get single portfolio", async () => {
  const { id, user_id, name, description, created, modified } = await run(
    api.getPortfolio(1)
  );
  expect(id).toBe(1);
  expect(user_id).toBeNumber();
  expect(name).toBeString();
  expect(description).toBeString();
  expect(created).toBeDate();
  expect(modified).toBeDate();
});

test("Delete portfolio", async () => {
  const { id } = await run(api.createPortfolio(fakePortfolio()));
  const { id: deletedId } = await run(api.deletePortfolio(id!));
  expect(id).toBe(deletedId);
});

test("Total invested/num assets is zero in new portfolio", async () => {
  const { total_invested, num_assets } = await run(
    api.createPortfolio(fakePortfolio())
  );

  expect(total_invested).toBe(0);
  expect(num_assets).toBe(0);
});

test("correct amount of invested/assets in portfolio", async () => {
  const { id } = await run(api.createPortfolio(fakePortfolio()));

  const a1 = await run(api.createAsset(id!, fakeAsset("msft")));
  const a2 = await run(api.createAsset(id!, fakeAsset("mcd")));
  const a3 = await run(api.createAsset(id!, fakeAsset("aapl")));

  await run(api.createTx(a1.id!, fakeBuy(10, 1)));
  await run(api.createTx(a2.id!, fakeBuy(10, 2)));
  await run(api.createTx(a3.id!, fakeBuy(10, 3)));

  const { total_invested, num_assets } = await run(api.getPortfolio(id!));

  expect(num_assets).toBe(3);
  expect(total_invested).toBe(60);
});
