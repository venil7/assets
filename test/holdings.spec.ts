import { beforeEach, expect, test } from "bun:test";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import { createAsset, getAsset } from "./asset.spec";
import { authenticate, run, type Methods } from "./index";
import { createPortfolio } from "./portfolio.spec";
import { createTx, type Transaction } from "./transactions.spec";
var methods: Methods;

var portfolioId: number;
var assetId: number;

beforeEach(async () => {
  methods = await run(authenticate());
  portfolioId = (await run(createPortfolio())).id!;
  assetId = (await run(createAsset(portfolioId!))).id!;
});

test("Calculate holding, invested and avg_price", async () => {
  const txs: [quantity: number, price: number, type: Transaction["type"]][] = [
    [10, 100, "buy"],
    [20, 110, "buy"],
    [30, 130, "buy"],
  ];
  for (const [quantity, price, type] of txs) {
    await run(createTx(assetId, type, quantity, price));
  }
  const { invested, holdings, avg_price } = await run(
    getAsset(portfolioId, assetId)
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
