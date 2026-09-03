import { login, run, type UserId } from "@darkruby/assets-core";
import { afterAll, beforeAll, expect, test } from "bun:test";
import * as E from "fp-ts/lib/Either";
import {
  BASE_URL,
  defaultApi,
  fakeNewUser,
  nonAdminApi,
  type TestApi
} from "./helper";

let api: TestApi;
let nonAdmin: TestApi;
const createdUsers: number[] = [];

beforeAll(async () => {
  api = await run(defaultApi());
  nonAdmin = await run(nonAdminApi());
});

afterAll(async () => {
  await Promise.allSettled(
    createdUsers.map((id) => api.user.delete(id as UserId)())
  );
  await run(nonAdmin.profile.delete()).catch(() => undefined);
});

test("login with wrong password fails", async () => {
  const res = await login(BASE_URL)({
    username: "admin",
    password: "wrong"
  })();
  expect(E.isLeft(res)).toBe(true);
  if (E.isLeft(res)) expect(res.left.message).toContain("Wrong password");
});

test("login with unknown user fails", async () => {
  const res = await login(BASE_URL)({
    username: "nobody@nowhere.com",
    password: "x"
  })();
  expect(E.isLeft(res)).toBe(true);
  if (E.isLeft(res))
    expect(res.left.message).toContain("Could not authenticate");
});

test("endpoints reject requests without a token", async () => {
  const res = await fetch(`${BASE_URL}/api/v1/profile`);
  expect(res.status).toBe(403);
  const body = (await res.json()) as { type: string; message: string };
  expect(body.type).toBe("Auth");
  expect(body.message).toContain("no token");
});

test("endpoints reject a garbage token", async () => {
  const res = await fetch(`${BASE_URL}/api/v1/profile`, {
    headers: { authorization: "Bearer garbage" }
  });
  expect(res.status).toBe(403);
  const body = (await res.json()) as { type: string; message: string };
  expect(body.type).toBe("Auth");
});

test("locked user cannot log in", async () => {
  const creds = fakeNewUser({ locked: true });
  const user = await run(api.user.create(creds));
  createdUsers.push(user.id);
  const res = await login(BASE_URL)({
    username: creds.username,
    password: creds.password
  })();
  expect(E.isLeft(res)).toBe(true);
});

test("account locks out after repeated failed logins", async () => {
  const creds = fakeNewUser();
  const user = await run(api.user.create(creds));
  createdUsers.push(user.id);
  for (let i = 0; i < 3; i++) {
    const res = await login(BASE_URL)({
      username: creds.username,
      password: "wrong"
    })();
    expect(E.isLeft(res), `attempt ${i + 1} should fail`).toBe(true);
  }
  // once login_attempts reach the limit even the correct password is rejected
  const res = await login(BASE_URL)({
    username: creds.username,
    password: creds.password
  })();
  expect(E.isLeft(res)).toBe(true);
});

test("a user locked after login has their token rejected", async () => {
  const creds = fakeNewUser();
  const user = await run(api.user.create(creds));
  createdUsers.push(user.id);
  const userApi = await run(defaultApi(creds));
  const { token } = await run(userApi.auth.refreshToken());
  // admin locks the account after the token was issued
  await run(
    api.user.update(user.id, {
      username: user.username,
      admin: user.admin,
      login_attempts: user.login_attempts,
      locked: true
    })
  );
  const res = await fetch(`${BASE_URL}/api/v1/profile`, {
    headers: { authorization: `Bearer ${token}` }
  });
  expect(res.status).toBe(403);
  const body = (await res.json()) as { type: string; message: string };
  expect(body.message).toContain("restricted");
});

test("refresh token can be used for subsequent requests", async () => {
  const creds = fakeNewUser();
  const user = await run(api.user.create(creds));
  createdUsers.push(user.id);
  const userApi = await run(defaultApi(creds));
  const { token } = await run(userApi.auth.refreshToken());
  const res = await fetch(`${BASE_URL}/api/v1/profile`, {
    headers: { authorization: `Bearer ${token}` }
  });
  expect(res.status).toBe(200);
  const body = (await res.json()) as { username: string };
  expect(body.username).toBe(creds.username);
});

test("non-admin cannot access admin user endpoints", async () => {
  const res = await nonAdmin.user.getMany()();
  expect(E.isLeft(res)).toBe(true);
  if (E.isLeft(res)) expect(res.left.message).toContain("admin");
  const res2 = await nonAdmin.user.create(fakeNewUser())();
  expect(E.isLeft(res2)).toBe(true);
});
