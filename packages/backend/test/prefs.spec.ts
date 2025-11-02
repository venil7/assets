import { run } from "@darkruby/assets-core";
import { afterAll, beforeAll, expect, test } from "bun:test";
import { fakePrefs, nonAdminApi, type TestApi } from "./helper";

let api: TestApi;
beforeAll(async () => {
  api = await run(nonAdminApi());
});
afterAll(async () => {
  await run(api.profile.delete());
});

test("Get prefs", async () => {
  const { base_ccy } = await run(api.prefs.get());
  expect(base_ccy).toBeString();
});

test("Update prefs", async () => {
  const prefs = fakePrefs();
  const { base_ccy } = await run(api.prefs.update(prefs));
  expect(base_ccy).toBe(prefs.base_ccy);
});
