import { beforeAll, expect, test } from "bun:test";
import { authenticate, run, type Methods } from "./index";
import { PORTFOLIO_URL, type Portfolio } from "./portfolio.spec";
var methods: Methods;

export type Asset = {
  id?: number;
  portfolio_id?: number;
  name: string;
  ticker: string;
  created?: string;
  modified?: string;
};
var portfolioId: number;
var ASSET_URL: string;

beforeAll(async () => {
  methods = await run(authenticate());
  const { id } = await run(
    methods.post<Portfolio>(PORTFOLIO_URL, {
      name: "prtfolio-for-asset",
      description: "-",
    })
  );
  portfolioId = id!;
  ASSET_URL = `${PORTFOLIO_URL}/${portfolioId}/assets`;
});

test("Create asset", async () => {
  const { id, portfolio_id, name, ticker, created, modified } = await run(
    methods.post<Asset>(ASSET_URL, {
      name: "microsoft",
      ticker: "MSFT",
    })
  );
  expect(id).toBeNumber();
  expect(portfolio_id).toBe(portfolioId);
  expect(name).toBe("microsoft");
  expect(ticker).toBe("MSFT");
  expect(created).toBeString();
  expect(modified).toBeString();
});

test("Get multiple assets", async () => {
  const assets = await run(methods.get<Asset[]>(ASSET_URL));
  expect(assets).toSatisfy((a) => Array.isArray(a) && a.length > 0);
});

test("Get single asset", async () => {
  const { id: assetId } = await run(
    methods.post<Asset>(ASSET_URL, {
      name: "check-me",
      ticker: "check-me-too",
    })
  );
  const { id, portfolio_id, name, ticker, created, modified } = await run(
    methods.get<Asset>(`${ASSET_URL}/${assetId}`)
  );
  expect(id).toBeNumber();
  expect(portfolio_id).toBe(portfolioId);
  expect(name).toBe("check-me");
  expect(ticker).toBe("check-me-too");
  expect(created).toBeString();
  expect(modified).toBeString();
});

test("Delete asset", async () => {
  const { id } = await run(
    methods.post<Asset>(ASSET_URL, {
      name: "aset-to-be-deleted",
      ticker: "--",
    })
  );

  const deleted = await run(methods.delete<boolean>(`${ASSET_URL}/${id}`));
  expect(deleted).toBeTrue();
});
