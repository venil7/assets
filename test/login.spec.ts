import { expect, test } from "bun:test";
import { login, run } from "./index";

test("login to API", async () => {
  const creds = login();
  const { token } = await run(creds);
  expect(token).toBeString();
});
