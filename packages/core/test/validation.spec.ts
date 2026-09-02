import { expect, test } from "bun:test";
import * as E from "fp-ts/lib/Either";
import {
  TxTypes,
  assetValidator,
  portfolioValidator,
  txValidator,
  txsUploadValidator
} from "../src";
import { shortPassword, shortUsername } from "../src/validation/user";
import {
  alphaNumOnly,
  length,
  match,
  noWhiteSpace,
  startsWithLetter
} from "../src/validation/util";

const validTx = {
  type: TxTypes.buy,
  quantity: 10,
  price: 100,
  date: new Date(),
  comments: ""
};

test("txValidator passes a valid tx", () => {
  expect(txValidator(validTx).valid).toBe(true);
});

test("txValidator rejects negative price", () => {
  const { valid, errors } = txValidator({ ...validTx, price: -1 });
  expect(valid).toBe(false);
  expect(errors.join()).toContain("price");
});

test("txValidator rejects zero quantity", () => {
  expect(txValidator({ ...validTx, quantity: 0 }).valid).toBe(false);
});

test("txValidator rejects future date", () => {
  const future = new Date(Date.now() + 24 * 60 * 60 * 1000);
  expect(txValidator({ ...validTx, date: future }).valid).toBe(false);
});

test("txsUploadValidator rejects empty list", () => {
  expect(txsUploadValidator({ txs: [], replace: true }).valid).toBe(false);
});

test("txsUploadValidator passes non-empty list", () => {
  expect(txsUploadValidator({ txs: [validTx], replace: false }).valid).toBe(
    true
  );
});

test("portfolioValidator rejects empty name", () => {
  expect(portfolioValidator({ name: "", description: "x" }).valid).toBe(false);
  expect(
    portfolioValidator({ name: "portfolio", description: "x" }).valid
  ).toBe(true);
});

test("assetValidator rejects empty ticker or name", () => {
  expect(assetValidator({ ticker: "", name: "x" }).valid).toBe(false);
  expect(assetValidator({ ticker: "msft", name: "" }).valid).toBe(false);
  expect(assetValidator({ ticker: "msft", name: "x" }).valid).toBe(true);
});

test("match rule", () => {
  expect(E.isRight(match("a", "a")(E.right("x")))).toBe(true);
  const res = match("a", "b")(E.right("x"));
  expect(E.isLeft(res)).toBe(true);
  if (E.isLeft(res)) expect(res.left[0].message).toBe("Passwords do not match");
});

test("length rule", () => {
  expect(E.isRight(length(3)("abc")(E.right("x")))).toBe(true);
  expect(E.isLeft(length(3)("ab")(E.right("x")))).toBe(true);
});

test("startsWithLetter rule", () => {
  expect(E.isRight(startsWithLetter("abc")(E.right("x")))).toBe(true);
  expect(E.isLeft(startsWithLetter("1abc")(E.right("x")))).toBe(true);
});

test("alphaNumOnly rule", () => {
  expect(E.isRight(alphaNumOnly("abc1")(E.right("x")))).toBe(true);
  expect(E.isLeft(alphaNumOnly("abc!")(E.right("x")))).toBe(true);
});

test("noWhiteSpace rule", () => {
  expect(E.isRight(noWhiteSpace("abc")(E.right("x")))).toBe(true);
  expect(E.isLeft(noWhiteSpace("a b")(E.right("x")))).toBe(true);
});

test("shortUsername rejects short / non-alpha-start / non-alphanumeric names", () => {
  expect(E.isRight(shortUsername("abc123")(E.right("x")))).toBe(true);
  expect(E.isLeft(shortUsername("ab")(E.right("x")))).toBe(true);
  expect(E.isLeft(shortUsername("_bc")(E.right("x")))).toBe(true);
  expect(E.isLeft(shortUsername("abc!")(E.right("x")))).toBe(true);
  expect(E.isLeft(shortUsername("a b")(E.right("x")))).toBe(true);
});

test("shortPassword rejects short passwords", () => {
  expect(E.isRight(shortPassword("abcde")(E.right("x")))).toBe(true);
  expect(E.isLeft(shortPassword("abcd")(E.right("x")))).toBe(true);
});
