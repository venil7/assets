import { run } from "@darkruby/assets-core";
import { afterAll, beforeAll, expect, test, afterEach } from "bun:test";
import { fakePortfolio, nonAdminApi, type TestApi } from "./helper";

let api: TestApi;
beforeAll(async () => {
  api = await run(nonAdminApi());
});

afterEach(async () => {
  const portfolios = await run(api.portfolio.getMany());
  for (const p of portfolios) {
    await run(api.portfolio.delete(p.id));
  }
});

afterAll(async () => {
  await run(api.profile.delete());
});

test("Get Summary", async () => {
  await run(api.portfolio.create(fakePortfolio()));
  await run(api.portfolio.create(fakePortfolio()));
  const { chart, meta, totals, changes } = await run(api.summary.get());
  expect(chart).toBeArray();
  expect(meta).toBeTruthy();
  expect(totals).toBeTruthy();
  expect(changes).toBeTruthy();
});

test("summary for an empty account is zeroed", async () => {
  const s = await run(api.summary.get());
  expect(s.numPortfolios).toBe(0);
  expect(s.invested).toBe(0);
  expect(s.realizedPnl).toBe(0);
  expect(s.fxImpact).toBe(0);
  expect(s.totals).toEqual({ returnValue: 0, returnPct: 0 });
  expect(s.chart.length).toBeGreaterThan(0);
  expect(s.meta.range).toBeString();
});
