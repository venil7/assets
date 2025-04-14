import * as NA from "fp-ts/lib/NonEmptyArray";

export const nonEmpty =
  <T>(fallback: () => T) =>
  (a: Array<T>): NA.NonEmptyArray<T> => {
    if (a.length > 0) return a as NA.NonEmptyArray<T>;
    return [fallback()];
  };
