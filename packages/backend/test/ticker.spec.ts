import { run } from "@darkruby/assets-core";
import { beforeAll, expect, test } from "bun:test";
import { type TestApi, testApi } from "./helper";

let api: TestApi;
beforeAll(async () => {
  api = await run(testApi());
});

test("Lookup ticker", async () => {
  const { quotes } = await run(api.lookupTicker("MSFT"));
  expect(quotes).toBeArray();
  expect(quotes[0].symbol).toBe("MSFT");
});
