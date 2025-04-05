import { expect, test } from "bun:test";
import * as E from "fp-ts/lib/Either";
import { formatValidationErrors } from "io-ts-reporters";
import { readFileSync } from "node:fs";
import path from "node:path";
import { ChartMetaDecoder } from "../src/decoders/yahoo/meta";

const readJson = (p: string): any => {
  const jsonAsString = readFileSync(path.resolve(__dirname, p)).toString();
  return JSON.parse(jsonAsString);
};

test("Decode GBPUSD chart", async () => {
  const rawData = readJson("./data/meta.json");
  const result = ChartMetaDecoder.decode(rawData);
  if (E.isLeft(result)) {
    console.error("--------->", formatValidationErrors(result.left));
  }
  expect(E.isRight(result)).toBe(true);
});
