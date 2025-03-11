import { beforeAll, expect, test } from "bun:test";
import { type Api } from "../client/api";
import { run, testApi } from "./helper";

var api: Api;
beforeAll(async () => {
  api = await run(testApi());
});

test("Lookup ticker", async () => {
  const { quotes } = await run(api.lookupTicker("MSFT"));
  expect(quotes).toBeArray();
  expect(quotes[0].symbol).toBe("MSFT");
});
