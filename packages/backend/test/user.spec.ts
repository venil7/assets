import { run, type UserId } from "@darkruby/assets-core";
import { beforeAll, expect, test } from "bun:test";
import * as E from "fp-ts/Either";
import { defaultApi, fakeCredentials, type TestApi } from "./helper";

let api: TestApi;
beforeAll(async () => {
  api = await run(defaultApi());
});

test("List users", async () => {
  const users = await run(api.user.getMany());
  expect(users).toBeArray();
});

test("Create user", async () => {
  const creds = fakeCredentials();
  const user = await run(api.user.create(creds));
  expect(user.username).toBe(creds.username);
});

test("Get user", async () => {
  const creds = fakeCredentials();
  const { id } = await run(api.user.create(creds));
  const user = await run(api.user.get(id));
  expect(user.id).toBe(id);
});

test("Update user", async () => {
  const creds = fakeCredentials();
  const user = await run(api.user.create(creds));
  const newCreds = fakeCredentials();
  const updatedUser = await run(api.user.update(user.id, newCreds));
  expect(user.id).toBe(updatedUser.id);
  expect(newCreds.username).toBe(updatedUser.username);
});

test("Delete user", async () => {
  const creds = fakeCredentials();
  const user = await run(api.user.create(creds));
  const { id } = await run(api.user.delete(user.id));
  expect(user.id).toBe(id as UserId);
  const deleted = await api.user.get(id as UserId)();
  expect(E.isLeft(deleted)).toBeTrue();
});

test("Create user, login and check profile & preferences", async () => {
  const creds = fakeCredentials();
  const user = await run(api.user.create(creds));
  expect(user.username).toBe(creds.username);
  const userApi = await run(defaultApi(creds));
  const { username } = await run(userApi.profile.get());
  const prefs = await run(userApi.preferences.get());
  expect(username).toBe(creds.username);
  expect(prefs.base_ccy).toBe("USD");
});
