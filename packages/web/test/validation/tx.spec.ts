import { TxTypes } from "@darkruby/assets-core";
import { expect, test } from "bun:test";
import { txsUploadValidator, txValidator } from "../../src/validation/tx";

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
