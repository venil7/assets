import { run } from "@darkruby/assets-core";
import { beforeAll, expect, test } from "bun:test";
import { fakePreferences, nonAdminApi, type TestApi } from "./helper";

let api: TestApi;
beforeAll(async () => {
  api = await run(nonAdminApi());
});

test("Get preferences", async () => {
  const { base_ccy } = await run(api.preferences.get());
  expect(base_ccy).toBeString();
});

test("Update preferences", async () => {
  const prefs = fakePreferences();
  const { base_ccy } = await run(api.preferences.update(prefs));
  expect(base_ccy).toBe(prefs.base_ccy);
});
