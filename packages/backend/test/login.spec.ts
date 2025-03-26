import { run } from "@darkruby/assets-core";
import { beforeAll, expect, test } from "bun:test";
import { testApi, type TestApi } from "./helper";

let api: TestApi;
beforeAll(async () => {
  api = await run(testApi());
});

test("Get refresh token", async () => {
  const { token } = await run(api.auth.refreshToken());
  expect(token).toBeString();
});
