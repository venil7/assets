import { expect, test } from "bun:test";
import { addYears } from "date-fns";
import { rangeForDate } from "../src";
import { now } from "../src/utils/date";

test("rangeForDate: 10y", () => {
  const res = rangeForDate(addYears(now(), -11));
  expect(res).toBe("max");
});
