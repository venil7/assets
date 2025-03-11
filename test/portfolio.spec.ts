import { beforeAll, expect, test } from "bun:test";
import faker from "faker";
import { type Api } from "../client/api";
import { run, testApi } from "./helper";

var api: Api;
beforeAll(async () => {
  api = await run(testApi());
});

test("Create portfolio", async () => {
  const [portfolioName, portfolioDescription] = [
    faker.lorem.slug(2),
    faker.lorem.slug(2),
  ];

  const { id, user_id, name, description, created, modified } = await run(
    api.createPortfolio(portfolioName, portfolioDescription)
  );
  expect(id).toBeNumber();
  expect(user_id).toBeNumber();
  expect(name).toBe(portfolioName);
  expect(description).toBe(portfolioDescription);
  expect(created).toBeString();
  expect(modified).toBeString();
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
  expect(created).toBeString();
  expect(modified).toBeString();
});

test("Delete portfolio", async () => {
  const { id } = await run(api.createPortfolio());

  const deleted = await run(api.deletePortfolio(id!));
  expect(deleted).toBeTrue();
});

test("Total invested/num assets is zero in new portfolio", async () => {
  const { total_invested, num_assets } = await run(api.createPortfolio());

  expect(total_invested).toBe(0);
  expect(num_assets).toBe(0);
});

test("correct amount of invested/assets in portfolio", async () => {
  const { id } = await run(api.createPortfolio());

  const a1 = await run(api.createAsset(id!));
  const a2 = await run(api.createAsset(id!));
  const a3 = await run(api.createAsset(id!));

  await run(api.createTx(a1.id!, "buy", 10, 1));
  await run(api.createTx(a2.id!, "buy", 10, 2));
  await run(api.createTx(a3.id!, "buy", 10, 3));

  const { total_invested, num_assets } = await run(api.getPortfolio(id!));

  expect(num_assets).toBe(3);
  expect(total_invested).toBe(60);
});
