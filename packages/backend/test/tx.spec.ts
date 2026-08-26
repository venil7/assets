import type { AppError, PostTx } from "@darkruby/assets-core";
import { defaultTxsUpload, run } from "@darkruby/assets-core";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { CsvPostTxDecoder } from "../src/decoders/tx";
import {
  D,
  fakeAsset,
  fakeBuy,
  fakePortfolio,
  fakeSell,
  nonAdminApi,
  type TestApi
} from "./helper";

let api: TestApi;
beforeAll(async () => {
  api = await run(nonAdminApi());
});
afterAll(async () => {
  await run(api.profile.delete());
});

const buyTx: PostTx = fakeBuy(10, 100);

test("Create transaction", async () => {
  const {
    tx: { id, asset_id, type, quantity, price, date, created, modified },
    asset
  } = await run(api.createPortfolioAssetTx(buyTx));
  expect(id).toBeNumber();
  expect(asset_id).toBe(asset.id);
  expect(type).toBe("buy");
  expect(quantity).toBe(10);
  expect(price).toBe(100);
  expect(date).toBeDate();
  expect(created).toBeDate();
  expect(modified).toBeDate();
});

test("Get multiple transactions", async () => {
  const { txs, asset, portfolio } = await run(
    api.createPortfolioAssetTxs([buyTx, buyTx, buyTx])
  );
  const transactions = await run(api.tx.getMany(portfolio.id, asset.id));
  expect(transactions).toSatisfy(
    (a) => Array.isArray(a) && a.length == txs.length
  );
});

test("Get single transaction", async () => {
  const { tx, asset, portfolio } = await run(api.createPortfolioAssetTx(buyTx));
  const { id, asset_id, type, quantity, price, date, created, modified } =
    await run(api.tx.get(portfolio.id, asset.id, tx.id));
  expect(id).toBeNumber();
  expect(asset_id).toBe(asset.id);
  expect(type).toBeString();
  expect(quantity).toBeNumber();
  expect(price).toBeNumber();
  expect(date).toBeDate();
  expect(created).toBeDate();
  expect(modified).toBeDate();
});

test("Delete transaction", async () => {
  const { tx, asset, portfolio } = await run(api.createPortfolioAssetTx(buyTx));
  const { id } = await run(api.tx.delete(portfolio.id, asset.id, tx.id));
  expect(tx.id).toBe(id);
});

test("Update buy tx", async () => {
  const { portfolio, asset, tx } = await run(
    api.createPortfolioAssetTx(fakeBuy())
  );

  const updateTx = fakeBuy();
  const {
    id: newId,
    type,
    quantity,
    price
  } = await run(api.tx.update(portfolio.id, asset.id, tx.id, updateTx));

  expect(newId).toBe(tx.id);
  expect(type).toBe(updateTx.type);
  expect(quantity).toBe(updateTx.quantity);
  expect(price).toBe(updateTx.price);
});

describe("Transaction invariant violation", () => {
  const TRANSACTION_INVARIANT_VIOLATION = "Transaction invariant violation";

  test("holdings when selling more than own", async () => {
    const { asset, portfolio } = await run(api.createPortfolioAssetTx(buyTx));
    const error = await pipe(
      api.tx.create(portfolio.id, asset.id, fakeSell(11, 1)),
      TE.orElseW(TE.of),
      run
    );
    expect((error as AppError).message).toContain(
      TRANSACTION_INVARIANT_VIOLATION
    );
  });

  test("when updating existing transaction", async () => {
    const { asset, tx, portfolio } = await run(
      api.createPortfolioAssetTx(buyTx)
    );
    const error = await pipe(
      api.tx.update(portfolio.id, asset.id, tx.id, fakeSell(11, 1)),
      TE.orElseW(TE.of),
      run
    );
    expect((error as AppError).message).toContain(
      TRANSACTION_INVARIANT_VIOLATION
    );
  });

  test("delete earlier BUY transaction that later is sold", async () => {
    const txs = [
      fakeBuy(3, 10, D("2025-10-01")),
      fakeBuy(5, 10, D("2025-10-02")),
      fakeSell(8, 10, D("2025-10-03"))
    ];

    const {
      asset,
      portfolio,
      txs: [t1, t2, t3]
    } = await run(api.createPortfolioAssetTxs(txs));

    // delete 2nd BUY transaction, and fail
    const error = await pipe(
      api.tx.delete(portfolio.id, asset.id, t2.id),
      TE.orElseW(TE.of),
      run
    );
    expect((error as AppError).message).toContain(
      TRANSACTION_INVARIANT_VIOLATION
    );
  });

  test("update earlier BUY transaction that later is sold", async () => {
    const txs = [
      fakeBuy(3, 10, D("2025-10-01")),
      fakeBuy(5, 10, D("2025-10-02")),
      fakeSell(8, 10, D("2025-10-03"))
    ];

    const {
      asset,
      portfolio,
      txs: [t1, t2, t3]
    } = await run(api.createPortfolioAssetTxs(txs));

    // update 2nd BUY transaction into SELL, and fail
    const error = await pipe(
      api.tx.update(portfolio.id, asset.id, t2.id, { ...t2, type: "sell" }),
      TE.orElseW(TE.of),
      run
    );
    expect((error as AppError).message).toMatch(
      TRANSACTION_INVARIANT_VIOLATION
    );
  });

  test("bulk upload with insufficient holdings is rejected", async () => {
    const { portfolio, asset } = await createAsset();
    const res = await api.tx.uploadAsset(
      portfolio.id,
      asset.id,
      defaultTxsUpload([fakeSell(1, 1)], false)
    )();
    expect(E.isLeft(res)).toBe(true);
    if (E.isLeft(res))
      expect(res.left.message).toContain(TRANSACTION_INVARIANT_VIOLATION);
  });
});

test("CSV roundtrip", async () => {
  const txs = [fakeBuy(), fakeSell()];
  const csv = CsvPostTxDecoder.encode(txs);
  const txs2 = await pipe(csv, liftTE(CsvPostTxDecoder), run);
  expect(txs2).toEqual(txs);
});

test("Delete all txs of an asset", async () => {
  const txs = [fakeBuy(), fakeBuy(), fakeBuy(), fakeBuy()];
  const { asset, portfolio } = await run(api.createPortfolioAssetTxs(txs));
  const res = await run(api.tx.deleteAllAsset(portfolio.id, asset.id));
  expect(res.id).toEqual(txs.length);
  const allTxs = await run(api.tx.getMany(portfolio.id, asset.id));
  expect(allTxs.length).toEqual(0);
});

test("Bulk upload with replace", async () => {
  const txs = [fakeBuy(), fakeBuy(), fakeBuy(), fakeBuy()];
  const additionalTxs = [fakeBuy(), fakeBuy()];
  const { asset, portfolio } = await run(api.createPortfolioAssetTxs(txs));
  const newTxs = await run(
    api.tx.uploadAsset(
      portfolio.id,
      asset.id,
      defaultTxsUpload(additionalTxs, true)
    )
  );
  expect(newTxs.length).toEqual(additionalTxs.length);
});

test("Bulk upload with no replace", async () => {
  const txs = [fakeBuy(), fakeBuy(), fakeBuy(), fakeBuy()];
  const additionalTxs = [fakeBuy(), fakeBuy()];
  const { asset, portfolio } = await run(api.createPortfolioAssetTxs(txs));
  const newTxs = await run(
    api.tx.uploadAsset(
      portfolio.id,
      asset.id,
      defaultTxsUpload(additionalTxs, false)
    )
  );
  expect(newTxs.length).toEqual(txs.length + additionalTxs.length);
});

const createAsset = async (ticker = "msft") => {
  const portfolio = await run(api.portfolio.create(fakePortfolio()));
  const asset = await run(api.asset.create(portfolio.id, fakeAsset(ticker)));
  return { portfolio, asset };
};

test("running values across consecutive buys", async () => {
  const { portfolio, asset } = await createAsset();
  const t1 = await run(
    api.tx.create(portfolio.id, asset.id, fakeBuy(10, 100, D("2023-01-01")))
  );
  const t2 = await run(
    api.tx.create(portfolio.id, asset.id, fakeBuy(10, 110, D("2023-01-02")))
  );
  expect(t1.running_holding).toBe(10);
  expect(t1.running_cost).toBe(1000);
  expect(t1.running_average_price).toBe(100);
  expect(t1.stretch).toBe(0);
  expect(t1.final_stretch).toBe(true);
  expect(t2.running_holding).toBe(20);
  expect(t2.running_cost).toBe(2100);
  expect(t2.running_average_price).toBe(105);
  expect(t2.running_break_even).toBe(2100);
  const a = await run(api.asset.get(portfolio.id, asset.id));
  expect(a.holdings).toBe(20);
  expect(a.invested).toBe(2100);
  expect(a.avg_price).toBe(105);
  expect(a.num_txs).toBe(2);
});

test("partial sell computes realized pnl and running values", async () => {
  const { portfolio, asset } = await createAsset();
  await run(
    api.tx.create(portfolio.id, asset.id, fakeBuy(10, 100, D("2023-01-01")))
  );
  const s = await run(
    api.tx.create(portfolio.id, asset.id, fakeSell(4, 120, D("2023-01-02")))
  );
  expect(s.running_holding).toBe(6);
  expect(s.realized_pnl).toBe(80);
  expect(s.pnl).toBe(80);
  expect(s.pnl_pct).toBeCloseTo(0.2);
  expect(s.value).toBe(480);
  expect(s.running_average_price).toBe(100);
  expect(s.running_break_even).toBe(600);
  const a = await run(api.asset.get(portfolio.id, asset.id));
  expect(a.holdings).toBe(6);
  expect(a.invested).toBe(520);
  expect(a.realized_pnl).toBe(80);
  expect(a.break_even).toBe(600);
  expect(a.avg_price).toBe(100);
});

test("sell below average price yields negative pnl", async () => {
  const { portfolio, asset } = await createAsset();
  await run(
    api.tx.create(portfolio.id, asset.id, fakeBuy(10, 100, D("2023-01-01")))
  );
  const s = await run(
    api.tx.create(portfolio.id, asset.id, fakeSell(4, 90, D("2023-01-02")))
  );
  expect(s.realized_pnl).toBe(-40);
  expect(s.pnl).toBe(-40);
  expect(s.pnl_pct).toBeCloseTo(-0.1);
});

test("full exit resets the stretch; re-entry starts a new final stretch", async () => {
  const { portfolio, asset } = await createAsset();
  await run(
    api.tx.create(portfolio.id, asset.id, fakeBuy(10, 100, D("2023-01-01")))
  );
  await run(
    api.tx.create(portfolio.id, asset.id, fakeSell(10, 110, D("2023-01-02")))
  );
  await run(
    api.tx.create(portfolio.id, asset.id, fakeBuy(5, 120, D("2023-01-03")))
  );
  // assert against the final view state (getMany), not the transient
  // create responses which are computed before later txs exist
  const [t1, t2, t3] = await run(api.tx.getMany(portfolio.id, asset.id));
  expect(t1.stretch).toBe(0);
  expect(t1.final_stretch).toBe(false);
  expect(t2.stretch).toBe(1); // the sell-all event itself is stretch 1
  expect(t2.final_stretch).toBe(false);
  expect(t2.running_holding).toBe(0);
  expect(t2.realized_pnl).toBe(100);
  expect(t3.stretch).toBe(1);
  expect(t3.final_stretch).toBe(true);
  expect(t3.running_holding).toBe(5);
  expect(t3.running_cost).toBe(600);
  expect(t3.running_average_price).toBe(120);
  const a = await run(api.asset.get(portfolio.id, asset.id));
  expect(a.holdings).toBe(5);
  expect(a.invested).toBe(600);
  expect(a.realized_pnl).toBe(100);
});

test("updating a tx recomputes running values", async () => {
  const { portfolio, asset } = await createAsset();
  const t1 = await run(
    api.tx.create(portfolio.id, asset.id, fakeBuy(10, 100, D("2023-01-01")))
  );
  await run(
    api.tx.create(portfolio.id, asset.id, fakeBuy(10, 110, D("2023-01-02")))
  );
  const updated = await run(
    api.tx.update(
      portfolio.id,
      asset.id,
      t1.id,
      fakeBuy(20, 100, D("2023-01-01"))
    )
  );
  expect(updated.running_holding).toBe(20);
  expect(updated.running_cost).toBe(2000);
  const txs = await run(api.tx.getMany(portfolio.id, asset.id));
  const last = txs[txs.length - 1];
  expect(last.running_holding).toBe(30);
  expect(last.running_average_price).toBeCloseTo(3100 / 30);
});

test("deleting a tx recomputes remaining running values", async () => {
  const { portfolio, asset } = await createAsset();
  const t1 = await run(api.tx.create(portfolio.id, asset.id, fakeBuy(10, 100)));
  const t2 = await run(api.tx.create(portfolio.id, asset.id, fakeBuy(10, 110)));
  await run(api.tx.delete(portfolio.id, asset.id, t1.id));
  const remaining = await run(api.tx.get(portfolio.id, asset.id, t2.id));
  expect(remaining.running_holding).toBe(10);
  expect(remaining.running_cost).toBe(1100);
  expect(remaining.running_average_price).toBe(110);
});

test("running values are isolated per asset", async () => {
  const { portfolio, asset: a1 } = await createAsset("msft");
  const a2 = await run(api.asset.create(portfolio.id, fakeAsset("aapl")));
  const b1 = await run(
    api.tx.create(portfolio.id, a1.id, fakeBuy(10, 100, D("2023-01-01")))
  );
  const b2 = await run(
    api.tx.create(portfolio.id, a2.id, fakeBuy(5, 50, D("2023-01-01")))
  );
  const s = await run(
    api.tx.create(portfolio.id, a1.id, fakeSell(4, 120, D("2023-01-02")))
  );
  expect(b1.running_holding).toBe(10);
  expect(b2.running_holding).toBe(5);
  expect(s.running_holding).toBe(6);
  const assets = await run(api.asset.getMany(portfolio.id));
  const a1now = assets.find((x) => x.id === a1.id)!;
  const a2now = assets.find((x) => x.id === a2.id)!;
  expect(a1now.holdings).toBe(6);
  expect(a2now.holdings).toBe(5);
});
