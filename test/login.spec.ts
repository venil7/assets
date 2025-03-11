import { beforeAll, expect, test } from "bun:test";
import { type Api } from "../client/api";
import { run, testApi } from "./helper";

var api: Api;
beforeAll(async () => {
  api = await run(testApi());
});

test("Get refresh token", async () => {
  const { token } = await run(api.getRefreshToken());
  expect(token).toBeString();
});
