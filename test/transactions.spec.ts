import { beforeAll, expect, test } from "bun:test";
import { type Asset } from "./asset.spec";
import { authenticate, run, type Methods } from "./index";
import { PORTFOLIO_URL, type Portfolio } from "./portfolio.spec";
var methods: Methods;

export type Transaction = {
  id?: number;
  asset_id?: number;
  type: string;
  quantity: number;
  price: number;
  date: string;
  created?: string;
  modified?: string;
};
var assetId: number;
var TRANSACTION_URL: string;

beforeAll(async () => {
  methods = await run(authenticate());
  const { id } = await run(
    methods.post<Portfolio>(PORTFOLIO_URL, {
      name: "portfolio-for-asset",
      description: "-",
    })
  );
  const portfolioId = id!;
  const { id: assetIdResult } = await run(
    methods.post<Asset>(`${PORTFOLIO_URL}/${portfolioId}/assets`, {
      name: "asset-for-transaction",
      ticker: "ASSET",
    })
  );
  assetId = assetIdResult!;
  TRANSACTION_URL = `${PORTFOLIO_URL}/assets/${assetId}/transactions`;
});

test("Create transaction", async () => {
  const { id, asset_id, type, quantity, price, date, created, modified } =
    await run(
      methods.post<Transaction>(TRANSACTION_URL, {
        type: "buy",
        quantity: 10,
        price: 100,
        date: "2022-01-01",
      })
    );
  expect(id).toBeNumber();
  expect(asset_id).toBe(assetId);
  expect(type).toBe("buy");
  expect(quantity).toBe(10);
  expect(price).toBe(100);
  expect(date).toBe("2022-01-01T00:00:00Z");
  expect(created).toBeString();
  expect(modified).toBeString();
});

test("Get multiple transactions", async () => {
  const transactions = await run(methods.get<Transaction[]>(TRANSACTION_URL));
  expect(transactions).toSatisfy((a) => Array.isArray(a) && a.length > 0);
});

test("Get single transaction", async () => {
  const { id: txid } = await run(
    methods.post<Transaction>(TRANSACTION_URL, {
      type: "buy",
      quantity: 10,
      price: 100,
      date: "2022-01-01",
    })
  );
  const { id, asset_id, type, quantity, price, date, created, modified } =
    await run(methods.get<Transaction>(`${TRANSACTION_URL}/${txid}`));

  expect(id).toBeNumber();
  expect(asset_id).toBe(assetId);
  expect(type).toBeString();
  expect(quantity).toBeNumber();
  expect(price).toBeNumber();
  expect(date).toBeString();
  expect(created).toBeString();
  expect(modified).toBeString();
});

test("Delete transaction", async () => {
  const { id } = await run(
    methods.post<Transaction>(TRANSACTION_URL, {
      type: "buy",
      quantity: 10,
      price: 100,
      date: "2022-01-01",
    })
  );

  const deleted = await run(
    methods.delete<boolean>(`${TRANSACTION_URL}/${id}`)
  );
  expect(deleted).toBeTrue();
});
