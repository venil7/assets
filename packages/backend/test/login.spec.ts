import { run } from "@darkruby/assets-core";
import { afterAll, beforeAll, expect, test } from "bun:test";
import { nonAdminApi, type TestApi } from "./helper";

let api: TestApi;
beforeAll(async () => {
  api = await run(nonAdminApi());
});
afterAll(async () => {
  await run(api.profile.delete());
});

test("Get refresh token", async () => {
  const { token } = await run(api.auth.refreshToken());
  expect(token).toBeString();
});
