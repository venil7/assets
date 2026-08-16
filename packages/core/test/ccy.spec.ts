import { expect, test } from "bun:test";
import * as E from "fp-ts/lib/Either";
import { ccyToLocale } from "../src/decoders/prefs";
import { BASE_CCYS, CcyDecoder } from "../src";

test("ccyToLocale maps every base currency", () => {
  const cases: readonly (readonly [string, string])[] = [
    ["USD", "en-US"],
    ["GBP", "en-GB"],
    ["EUR", "de-DE"],
    ["CAD", "en-CA"],
    ["AUD", "en-AU"],
    ["CHF", "de-CH"],
    ["SEK", "sv-SE"],
    ["NOK", "no-NO"],
    ["DKK", "da-DK"],
    ["NZD", "en-NZ"],
    ["JPY", "ja-JP"],
    ["INR", "en-IN"]
  ];
  cases.forEach(([ccy, locale]) => {
    expect(ccyToLocale(ccy as (typeof BASE_CCYS)[number]), `ccyToLocale(${ccy})`).toBe(locale);
  });
});

test("ccyToLocale defaults to en-US for unknown ccy (incl. GBp)", () => {
  expect(ccyToLocale("GBp" as (typeof BASE_CCYS)[number])).toBe("en-US");
});

test("CcyDecoder accepts every base currency", () => {
  BASE_CCYS.forEach((ccy) => {
    expect(E.isRight(CcyDecoder.decode(ccy)), `CcyDecoder(${ccy})`).toBe(true);
  });
});

test("CcyDecoder rejects unknown currencies", () => {
  expect(E.isLeft(CcyDecoder.decode("XXX"))).toBe(true);
  expect(E.isLeft(CcyDecoder.decode("usd"))).toBe(true);
  expect(E.isLeft(CcyDecoder.decode(""))).toBe(true);
});
