import { expect, test } from "bun:test";
import { decimalFormatter, moneyFormatter, percentFormatter } from "../src/util/number";

test("moneyFormatter formats USD with default locale", () => {
  expect(moneyFormatter("USD")(1234.5)).toBe("$1,234.50");
});

test("moneyFormatter uses default currency when currency is null", () => {
  expect(moneyFormatter("USD")(1234.5, null)).toBe("$1,234.50");
});

test("moneyFormatter honours an explicit currency and locale", () => {
  expect(moneyFormatter("USD")(1234.5, "GBP", "en-GB")).toBe("£1,234.50");
});

test("moneyFormatter divides GBp by 100", () => {
  expect(moneyFormatter("GBp")(2500)).toBe("£25.00");
});

test("moneyFormatter handles zero and negative", () => {
  expect(moneyFormatter("USD")(0)).toBe("$0.00");
  expect(moneyFormatter("USD")(-12.5)).toBe("-$12.50");
});

test("decimalFormatter", () => {
  expect(decimalFormatter("en-US")(1234.567)).toBe("1,234.57");
  expect(decimalFormatter("en-US", 1)(1234.56)).toBe("1,234.6");
  expect(decimalFormatter("de-DE")(1234.5)).toBe("1.234,5");
});

test("percentFormatter", () => {
  expect(percentFormatter("en-US")(0.2537)).toBe("25.37%");
  expect(percentFormatter("en-US", 0)(0.5)).toBe("50%");
});
