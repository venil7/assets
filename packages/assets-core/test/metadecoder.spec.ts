import { expect, test } from "bun:test";
import * as E from "fp-ts/lib/Either";
import { formatValidationErrors } from "io-ts-reporters";
import { ChartMetaDecoder } from "../src/decoders/yahoo/meta";
import { readJsonFiles } from "./helper";

const files = readJsonFiles("./data/meta");

files.forEach(([fname, json]) => {
  test(`Decode ${fname} meta`, async () => {
    const result = ChartMetaDecoder.decode(json);
    if (E.isLeft(result)) {
      console.error(formatValidationErrors(result.left));
    }
    expect(E.isRight(result)).toBe(true);
  });
});
