import { beforeAll, expect, test } from "bun:test";
import { api as getApi, type Api } from "./api";
import { authenticate, run } from "./index";

var api: Api;
beforeAll(async () => {
  const methods = await run(authenticate());
  api = getApi(methods);
});

test("Lookup ticker", async () => {
  const { quotes } = await run(api.lookupTicker("MSFT"));
  expect(quotes).toBeArray();
  expect(quotes[0].symbol).toBe("MSFT");
});
