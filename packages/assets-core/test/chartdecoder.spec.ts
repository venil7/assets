import { expect, test } from "bun:test";
import * as E from "fp-ts/lib/Either";
import { formatValidationErrors } from "io-ts-reporters";
import { readFileSync } from "node:fs";
import path from "node:path";
import { YahooChartDataDecoder } from "../src/decoders/yahoo/chart";

const readJson = (p: string): any => {
  const jsonAsString = readFileSync(path.resolve(__dirname, p)).toString();
  return JSON.parse(jsonAsString);
};

test("Decode AAPL chart", async () => {
  const rawData = readJson("./data/AAPL.json");
  const result = YahooChartDataDecoder.decode(rawData);
  expect(E.isRight(result)).toBe(true);
});

test("Decode MSFT chart", async () => {
  const rawData = readJson("./data/MSFT.json");
  const result = YahooChartDataDecoder.decode(rawData);
  expect(E.isRight(result)).toBe(true);
});

test("Decode VUSA.L chart", async () => {
  const rawData = readJson("./data/VUSA.L.json");
  const result = YahooChartDataDecoder.decode(rawData);
  expect(E.isRight(result)).toBe(true);
});

test("Decode FUND chart", async () => {
  const rawData = readJson("./data/FUND.json");
  const result = YahooChartDataDecoder.decode(rawData);
  if (E.isLeft(result)) {
    console.error("--------->", formatValidationErrors(result.left));
  }
  expect(E.isRight(result)).toBe(true);
});

test("Decode GBPUSD chart", async () => {
  const rawData = readJson("./data/GBPUSD.json");
  const result = YahooChartDataDecoder.decode(rawData);
  expect(E.isRight(result)).toBe(true);
});

test("Decode Non existent error chart", async () => {
  const rawData = readJson("./data/NONEXIST.json");
  const result = YahooChartDataDecoder.decode(rawData);
  expect(E.isLeft(result) && result.left[0].message).toBe(
    "Not Found - No data found, symbol may be delisted"
  );
});
