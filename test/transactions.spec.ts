import { beforeAll, expect, test } from "bun:test";
import { formatISO, startOfDay } from "date-fns";
import { createAsset } from "./asset.spec";
import { authenticate, BASE_URL, run, type Methods } from "./index";
import { createPortfolio } from "./portfolio.spec";

export const TX_URL = (assetId: number) =>
  `${BASE_URL}/api/v1/portfolio/assets/${assetId}/transactions`;

export type Transaction = {
  id?: number;
  asset_id?: number;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  date: string;
  created?: string;
  modified?: string;
};
var methods: Methods;

export const createTx = (
  assetId: number,
  type: Transaction["type"],
  quantity = 1,
  price = 10,
  date = formatISO(new Date(), { representation: "date" })
) =>
  methods.post<Transaction>(TX_URL(assetId), {
    type,
    quantity,
    price,
    date,
  });

export const getTx = (assetId: number, id: number) =>
  methods.get<Transaction>(`${TX_URL(assetId)}/${id}`);

export const getTxs = (assetId: number) =>
  methods.get<Transaction[]>(TX_URL(assetId));

export const deleteTx = (assetId: number, id: number) =>
  methods.delete<Transaction>(`${TX_URL(assetId)}/${id}`);

var portfolioId = 0,
  assetId = 0;

beforeAll(async () => {
  methods = await run(authenticate());
  portfolioId = (await run(createPortfolio())).id!;
  assetId = (await run(createAsset(portfolioId!))).id!;
});

test("Create transaction", async () => {
  const { id, asset_id, type, quantity, price, date, created, modified } =
    await run(
      createTx(
        assetId,
        "buy",
        10,
        100,
        formatISO(new Date(), { representation: "date" })
      )
    );
  expect(id).toBeNumber();
  expect(asset_id).toBe(assetId);
  expect(type).toBe("buy");
  expect(quantity).toBe(10);
  expect(price).toBe(100);
  expect(date).toBe(
    formatISO(startOfDay(new Date()), { representation: "complete" })
  );
  expect(created).toBeString();
  expect(modified).toBeString();
});

test("Get multiple transactions", async () => {
  const transactions = await run(getTxs(assetId));
  expect(transactions).toSatisfy((a) => Array.isArray(a) && a.length > 0);
});

test("Get single transaction", async () => {
  const { id: txId } = await run(createTx(assetId, "buy"));
  const { id, asset_id, type, quantity, price, date, created, modified } =
    await run(getTx(assetId, txId!));

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
  const { id: txId } = await run(createTx(assetId, "buy"));
  const deleted = await run(deleteTx(assetId, txId!));
  expect(deleted).toBeTrue();
});
