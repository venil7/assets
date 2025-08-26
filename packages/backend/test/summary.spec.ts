import { run } from "@darkruby/assets-core";
import { beforeAll, expect, test } from "bun:test";
import { fakePortfolio, nonAdminApi, type TestApi } from "./helper";

let api: TestApi;
beforeAll(async () => {
  api = await run(nonAdminApi());
});

test("Get Summary", async () => {
  await run(api.portfolio.create(fakePortfolio()));
  await run(api.portfolio.create(fakePortfolio()));
  const { chart, meta, totals, value } = await run(api.summary.get());
  expect(chart).toBeArray();
  expect(meta).toBeTruthy();
  expect(totals).toBeTruthy();
  expect(value).toBeTruthy();
});
