import { run } from "@darkruby/assets-core";
import { beforeAll, expect, test } from "bun:test";
import {
  defaultApi,
  fakeCredentials,
  nonAdminApi,
  type TestApi,
} from "./helper";

let api: TestApi;
beforeAll(async () => {
  api = await run(nonAdminApi());
});

test("Get own profile", async () => {
  const { id, admin, username } = await run(api.profile.get());
  expect(username).toBeString();
  expect(admin).toBeFalse();
  expect(id).toBeNumber();
});

test("Update own profile", async () => {
  const creds = fakeCredentials();
  await run(api.profile.update(creds));
  const newApi = await run(defaultApi(creds));
  const { id, admin, username } = await run(newApi.profile.get());
  expect(username).toBe(creds.username);
  expect(admin).toBeFalse();
  expect(id).toBeNumber();
});
