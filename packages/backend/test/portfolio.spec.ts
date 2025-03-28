import { run } from "@darkruby/assets-core";
import { beforeAll, expect, test } from "bun:test";
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

test("Create portfolio", async () => {
  const portfolio = fakePortfolio();
  const { id, user_id, name, description, created, modified } = await run(
    api.portfolio.create(portfolio)
  );
  expect(id).toBeNumber();
  expect(user_id).toBeNumber();
  expect(name).toBe(portfolio.name);
  expect(description).toBe(portfolio.description);
  expect(created).toBeDate();
  expect(modified).toBeDate();
});

test("Get multiple portfolios", async () => {
  const portfolios = await run(api.portfolio.getMany());
  expect(portfolios).toSatisfy((a) => Array.isArray(a) && a.length > 0);
});

test("Get single portfolio", async () => {
  const p = await run(api.portfolio.create(fakePortfolio()));
  const { id, user_id, name, description, created, modified } = await run(
    api.portfolio.get(p.id)
  );
  expect(id).toBe(p.id);
  expect(user_id).toBeNumber();
  expect(name).toBeString();
  expect(description).toBeString();
  expect(created).toBeDate();
  expect(modified).toBeDate();
});

test("Delete portfolio", async () => {
  const { id } = await run(api.portfolio.create(fakePortfolio()));
  const { id: deletedId } = await run(api.portfolio.delete(id!));
  expect(id).toBe(deletedId);
});

test("Total invested/num assets is zero in new portfolio", async () => {
  const { total_invested, num_assets } = await run(
    api.portfolio.create(fakePortfolio())
  );

  expect(total_invested).toBe(0);
  expect(num_assets).toBe(0);
});

test("correct amount of invested/assets in portfolio", async () => {
  const { id } = await run(api.portfolio.create(fakePortfolio()));

  const a1 = await run(api.asset.create(id!, fakeAsset("msft")));
  const a2 = await run(api.asset.create(id!, fakeAsset("mcd")));
  const a3 = await run(api.asset.create(id!, fakeAsset("aapl")));

  await run(api.tx.create(a1.id!, fakeBuy(10, 1)));
  await run(api.tx.create(a2.id!, fakeBuy(10, 2)));
  await run(api.tx.create(a3.id!, fakeBuy(10, 3)));

  const { total_invested, num_assets } = await run(api.portfolio.get(id!));

  expect(num_assets).toBe(3);
  expect(total_invested).toBe(60);
});

test("Update portfolio", async () => {
  const { id } = await run(api.portfolio.create(fakePortfolio()));

  const updatePortfolio = fakePortfolio();
  const {
    id: newId,
    name,
    description,
  } = await run(api.portfolio.update(id!, updatePortfolio));

  expect(newId).toBe(id);
  expect(name).toBe(updatePortfolio.name);
  expect(description).toBe(updatePortfolio.description);
});
