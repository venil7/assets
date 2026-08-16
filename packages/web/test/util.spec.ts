import { expect, test } from "bun:test";
import { fallback } from "../src/util/func";
import { yesNo } from "../src/util/yesno";

test("yesNo", () => {
  expect(yesNo(true)).toBe("Yes");
  expect(yesNo(false)).toBe("No");
});

test("fallback returns nodata for nullish input", () => {
  const f = fallback((x: number) => `${x}`);
  expect(f(null)).toBe("-");
  expect(f(undefined)).toBe("-");
  expect(f(5)).toBe("5");
});

test("fallback supports a custom nodata marker", () => {
  const f = fallback((x: number) => `${x}`, "--");
  expect(f(null)).toBe("--");
  expect(f(7)).toBe("7");
});

test("fallback passes through extra args", () => {
  const f = fallback((x: number, suffix: string) => `${x}${suffix}`);
  expect(f(5, "x")).toBe("5x");
  expect(f(null, "x")).toBe("-");
});
