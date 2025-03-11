import { beforeAll, expect, test } from "bun:test";
import { api as getApi, type Api } from "./api";
import { authenticate, run } from "./index";

var api: Api;
beforeAll(async () => {
  const methods = await run(authenticate());
  api = getApi(methods);
});

test("Get refresh token", async () => {
  const { token } = await run(api.getRefreshToken());
  expect(token).toBeString();
});
