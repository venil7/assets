import { beforeAll, expect, test } from "bun:test";
import { authenticate, BASE_URL, run, type TES } from "./index";

var get: <TResult>(url: string) => TES<TResult>;
var post: <TResult>(url: string, body: {}) => TES<TResult>;

const URL = `${BASE_URL}/api/v1/portfolio`;

beforeAll(async () => {
  const methods = authenticate();
  const { get: gget, post: ppost } = await run(methods);
  get = gget;
  post = ppost;
});

test("Create portfolio", async () => {
  const portfolio = get<{ a: string }>(URL);
  const { a } = await run(portfolio);
  expect(a).toBeString();
});
