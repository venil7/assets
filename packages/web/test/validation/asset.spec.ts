import { expect, test } from "bun:test";
import { assetValidator } from "../../src/validation/asset";

test("assetValidator rejects empty ticker or name", () => {
  expect(assetValidator({ ticker: "", name: "x" }).valid).toBe(false);
  expect(assetValidator({ ticker: "msft", name: "" }).valid).toBe(false);
  expect(assetValidator({ ticker: "msft", name: "x" }).valid).toBe(true);
});
