import { expect, test } from "bun:test";
import * as E from "fp-ts/lib/Either";
import { formatValidationErrors } from "io-ts-reporters";
import { YahooChartDataDecoder } from "../src/decoders/yahoo/chart";
import { readJsonFiles } from "./helper";

const files = readJsonFiles("./data");

files.forEach(([fname, json]) => {
  test(`Decode ${fname} chart`, async () => {
    const result = YahooChartDataDecoder.decode(json);
    if (E.isLeft(result)) {
      console.error(formatValidationErrors(result.left));
    }
    expect(E.isRight(result)).toBe(true);
  });
});

const err = readJsonFiles("./data/error");

err.forEach(([fname, json]) => {
  test(`Decode ${fname} error chart`, async () => {
    const result = YahooChartDataDecoder.decode(json);
    expect(E.isLeft(result) && result.left[0].message).toBe(
      "Not Found - No data found, symbol may be delisted"
    );
  });
});
