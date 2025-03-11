import { beforeAll, expect, test } from "bun:test";
import { formatISO, startOfDay } from "date-fns";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { type Api, api as getApi } from "./api";
import { authenticate, run } from "./index";

var api: Api;

var portfolioId = 0,
  assetId = 0;

beforeAll(async () => {
  const methods = await run(authenticate());
  api = getApi(methods);
  portfolioId = (await run(api.createPortfolio())).id!;
  assetId = (await run(api.createAsset(portfolioId!))).id!;
});

test("Create transaction", async () => {
  const { id, asset_id, type, quantity, price, date, created, modified } =
    await run(
      api.createTx(
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
  const transactions = await run(api.getTxs(assetId));
  expect(transactions).toSatisfy((a) => Array.isArray(a) && a.length > 0);
});

test("Get single transaction", async () => {
  const { id: txId } = await run(api.createTx(assetId, "buy"));
  const { id, asset_id, type, quantity, price, date, created, modified } =
    await run(api.getTx(assetId, txId!));

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
  const { id: txId } = await run(api.createTx(assetId, "buy"));
  const deleted = await run(api.deleteTx(assetId, txId!));
  expect(deleted).toBeTrue();
});

test("Insufficient holdings when selling more than own", async () => {
  const { id: portfolioId } = await run(api.createPortfolio());
  const { id: assetId } = await run(api.createAsset(portfolioId!));
  await run(api.createTx(assetId!, "buy", 10, 1));
  const error = await pipe(
    api.createTx(assetId!, "sell", 11, 1),
    TE.orElseW((x) => TE.of(x)),
    run
  );
  expect(error).toBe("failed to insert transaction: Insufficient holdings");
});
