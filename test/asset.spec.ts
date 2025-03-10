import { beforeAll, expect, test } from "bun:test";
import faker from "faker";
import { authenticate, run, type Methods } from "./index";
import { createPortfolio, PORTFOLIO_URL } from "./portfolio.spec";

var methods: Methods;

export type Asset = {
  id?: number;
  portfolio_id?: number;
  name: string;
  ticker: string;
  created?: string;
  modified?: string;
};

export type AssetHolding = Asset & {
  holdings: number;
  invested: number;
  avg_price: number;
};

var PORTFOLIO_ID = 0;

export const createAsset = (
  portfolioId: number,
  name?: string,
  ticker?: string
) =>
  methods.post<AssetHolding>(`${PORTFOLIO_URL}/${portfolioId}/assets`, {
    name: name ?? faker.lorem.slug(2),
    ticker: ticker ?? faker.lorem.slug(1),
  });

export const getAsset = (portfolioId: number, id: number) =>
  methods.get<AssetHolding>(`${PORTFOLIO_URL}/${portfolioId}/assets/${id}`);

export const getAssets = (portfolioId: number) =>
  methods.get<AssetHolding[]>(`${PORTFOLIO_URL}/${portfolioId}/assets`);

export const deleteAsset = (portfolioId: number, id: number) =>
  methods.delete<Asset>(`${PORTFOLIO_URL}/${portfolioId}/assets/${id}`);

beforeAll(async () => {
  methods = await run(authenticate());
  PORTFOLIO_ID = (await run(createPortfolio())).id!;
});

test("Create asset", async () => {
  const [assetName, assetTicker] = [faker.lorem.slug(2), faker.lorem.slug(2)];
  const { id, portfolio_id, name, ticker, created, modified } = await run(
    createAsset(PORTFOLIO_ID, assetName, assetTicker)
  );
  expect(id).toBeNumber();
  expect(portfolio_id).toBe(PORTFOLIO_ID);
  expect(name).toBe(assetName);
  expect(ticker).toBe(assetTicker);
  expect(created).toBeString();
  expect(modified).toBeString();
});

test("Get multiple assets", async () => {
  const assets = await run(getAssets(PORTFOLIO_ID));
  expect(assets).toSatisfy((a) => Array.isArray(a) && a.length > 0);
});

test("Get single asset", async () => {
  const [assetName, assetTicker] = [faker.lorem.slug(2), faker.lorem.slug(2)];
  const { id: assetId } = await run(
    createAsset(PORTFOLIO_ID, assetName, assetTicker)
  );
  const { id, portfolio_id, name, ticker, created, modified } = await run(
    getAsset(PORTFOLIO_ID, assetId!)
  );
  expect(id).toBeNumber();
  expect(portfolio_id).toBe(PORTFOLIO_ID);
  expect(name).toBe(assetName);
  expect(ticker).toBe(assetTicker);
  expect(created).toBeString();
  expect(modified).toBeString();
});

test("Delete asset", async () => {
  const { id } = await run(createAsset(PORTFOLIO_ID));

  const deleted = await run(deleteAsset(PORTFOLIO_ID, id!));
  expect(deleted).toBeTrue();
});
