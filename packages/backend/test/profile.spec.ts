import { run, type UserId } from "@darkruby/assets-core";
import { afterAll, beforeAll, expect, test } from "bun:test";
import * as E from "fp-ts/Either";
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
afterAll(async () => {
  await run(api.profile.delete());
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

test("Delete own profile", async () => {
  const adminApi = await run(defaultApi());
  const creds = fakeCredentials();
  const user = await run(adminApi.user.create(creds));
  const userApi = await run(defaultApi(creds));
  const { id } = await run(userApi.profile.delete());

  expect(user.id).toBe(id as UserId);
  const profile = await userApi.profile.get()();
  expect(E.isLeft(profile)).toBe(true);
});
