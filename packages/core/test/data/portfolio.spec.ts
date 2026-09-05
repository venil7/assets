import { expect, test } from "bun:test";
import * as E from "fp-ts/lib/Either";
import { PostPortfolioDecoder } from "../../src";

test("portfolio decoder with undefined description", () => {
  const json = { name: "whatever" };
  const portfolio = PostPortfolioDecoder.decode(json);
  expect(E.isRight(portfolio)).toBeTrue();
});

test("portfolio decoder with null description", () => {
  const json = { name: "whatever", description: null };
  const portfolio = PostPortfolioDecoder.decode(json);
  expect(E.isRight(portfolio)).toBeTrue();
});

test("portfolio decoder with empty description", () => {
  const json = { name: "whatever", description: "" };
  const portfolio = PostPortfolioDecoder.decode(json);
  expect(E.isRight(portfolio)).toBeTrue();
});

test("portfolio decoder with text description", () => {
  const json = { name: "whatever", description: "test" };
  const portfolio = PostPortfolioDecoder.decode(json);
  expect(E.isRight(portfolio)).toBeTrue();
});
