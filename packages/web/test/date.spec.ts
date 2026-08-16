import { expect, test } from "bun:test";
import { dateFmt, dateTimeFmt, iso } from "../src/util/date";

// local-time construction so the assertions are timezone-independent
const d = new Date(2023, 9, 15, 14, 30, 0); // 15 Oct 2023 14:30 local

test("iso returns the date-only representation", () => {
  expect(iso(d)).toBe("2023-10-15");
});

test("dateFmt formats dd MMM yyyy", () => {
  expect(dateFmt(d)).toBe("15 Oct 2023");
});

test("dateTimeFmt formats dd MMM yyyy hh:mma", () => {
  expect(dateTimeFmt(d)).toBe("15 Oct 2023 02:30PM");
});
