import { run } from "@darkruby/assets-core";
import { afterAll, beforeAll, expect, test } from "bun:test";
import { type TestApi, nonAdminApi } from "./helper";

let api: TestApi;
beforeAll(async () => {
  api = await run(nonAdminApi());
});
afterAll(async () => {
  await run(api.profile.delete());
});

test("Lookup ticker", async () => {
  const { quotes } = await run(api.yahoo.lookupTicker("MSFT"));
  expect(quotes).toBeArray();
  expect(quotes[0].symbol).toBe("MSFT");
});
