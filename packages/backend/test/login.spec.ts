import { run } from "@darkruby/assets-core";
import { beforeAll, expect, test } from "bun:test";
import { nonAdminApi, type TestApi } from "./helper";

let api: TestApi;
beforeAll(async () => {
  api = await run(nonAdminApi());
});

test("Get refresh token", async () => {
  const { token } = await run(api.auth.refreshToken());
  expect(token).toBeString();
});
