import { expect, test } from "bun:test";
import { portfolioValidator } from "../../src/validation/portfolio";

test("portfolioValidator rejects empty name", () => {
  expect(portfolioValidator({ name: "", description: "x" }).valid).toBe(false);
  expect(
    portfolioValidator({ name: "portfolio", description: "x" }).valid
  ).toBe(true);
});
