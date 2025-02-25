import { beforeAll, expect, test } from "bun:test";
import { authenticate, BASE_URL, run, type TES } from "./index";

var get: <TResult>(url: string) => TES<TResult>;
var post: <TResult>(url: string, body: {}) => TES<TResult>;

const URL = `${BASE_URL}/auth/hello`;

beforeAll(async () => {
  const methods = authenticate();
  const { get: gget, post: ppost } = await run(methods);
  get = gget;
  post = ppost;
});

test("Get Success response", async () => {
  const portfolio = get<{ id: number; username: string }>(URL);
  const { id, username } = await run(portfolio);
  expect(id).toBe(1);
  expect(username).toBe("admin");
});
