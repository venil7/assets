import { run, type UserId } from "@darkruby/assets-core";
import { afterAll, beforeAll, expect, test } from "bun:test";
import faker from "faker";
import * as E from "fp-ts/Either";
import { defaultApi, fakeNewUser, nonAdminApi, type TestApi } from "./helper";

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

test("Update own profile (username only)", async () => {
  const profile = await run(api.profile.get());
  const newProfile = { ...profile, username: faker.internet.email() };
  const { id, admin, username } = await run(api.profile.update(newProfile));
  expect(username).toBe(newProfile.username);
  expect(admin).toBeFalse();
  expect(id).toBeNumber();
});

test("Update own password", async () => {
  // create new user
  const adminApi = await run(defaultApi());
  const user1 = fakeNewUser();
  await run(adminApi.user.create(user1));
  // login as that user
  const api = await run(defaultApi(user1));
  // generate new password and change it
  const { password: newPassword } = fakeNewUser();
  const changePassword = {
    oldPassword: user1.password,
    newPassword,
    repeat: newPassword,
  };
  await run(api.profile.password(changePassword));
  // login with new password
  const api1 = await run(defaultApi({ ...user1, password: newPassword }));
  expect(api1).toBeTruthy();
});

test("Delete own profile", async () => {
  const adminApi = await run(defaultApi());
  const creds = fakeNewUser();
  const user = await run(adminApi.user.create(creds));
  const userApi = await run(defaultApi(creds));
  const { id } = await run(userApi.profile.delete());

  expect(user.id).toBe(id as UserId);
  const profile = await userApi.profile.get()();
  expect(E.isLeft(profile)).toBe(true);
});
