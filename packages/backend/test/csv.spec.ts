import { PostTxDecoder } from "@darkruby/assets-core";
import { expect, test } from "bun:test";
import * as E from "fp-ts/lib/Either";
import { fromCsv } from "../src/decoders/csv";

const decoder = fromCsv(PostTxDecoder);

const validCsv = `type,quantity,price,date,comments
buy,10,100,2023-10-15T00:00:00.000Z,
sell,5,120,2023-10-16T00:00:00.000Z,note`;

test("fromCsv decodes valid rows", () => {
  const res = decoder.decode(validCsv);
  expect(E.isRight(res)).toBe(true);
  if (E.isRight(res)) {
    expect(res.right).toHaveLength(2);
    expect(res.right[0].type).toBe("buy");
    expect(res.right[0].quantity).toBe(10);
    expect(res.right[0].price).toBe(100);
    expect(res.right[1].type).toBe("sell");
    expect(res.right[1].quantity).toBe(5);
    expect(res.right[1].comments).toBe("note");
  }
});

test("fromCsv fails on malformed csv", () => {
  const res = decoder.decode(`type,quantity\nbuy,"unterminated`);
  expect(E.isLeft(res)).toBe(true);
});

test("fromCsv fails when a row does not satisfy the decoder", () => {
  const res = decoder.decode(
    `type,quantity,price,date,comments\nbuy,abc,100,2023-10-15T00:00:00.000Z,`
  );
  expect(E.isLeft(res)).toBe(true);
});

test("fromCsv empty input decodes to an empty array", () => {
  const res = decoder.decode("");
  expect(E.isRight(res)).toBe(true);
  if (E.isRight(res)) expect(res.right).toEqual([]);
});

test("fromCsv encode produces a csv string", () => {
  const csv = decoder.encode([
    { type: "buy", quantity: 10, price: 100, date: new Date("2023-10-15T00:00:00.000Z"), comments: "" }
  ]);
  expect(csv).toContain("type,quantity,price,date,comments");
  expect(csv).toContain("buy");
});
