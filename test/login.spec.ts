import { beforeAll, expect, test } from "bun:test";
import { authenticate, BASE_URL, run, type Methods } from "./index";

const AUTH_URL = `${BASE_URL}/api/v1/auth`;
const REFRESH_TOKEN_URL = `${AUTH_URL}/refresh_token`;
var methods: Methods;

beforeAll(async () => {
  methods = await run(authenticate());
});

test("Get refresh token", async () => {
  const { token } = await run(
    methods.get<{ token: string }>(REFRESH_TOKEN_URL)
  );
  expect(token).toBeString();
});
