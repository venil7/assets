import * as NA from "fp-ts/lib/NonEmptyArray";

export const onEmpty =
  <T>(fallback: () => T) =>
  (a: Array<T>): NA.NonEmptyArray<T> => {
    if (a.length > 0) return a as NA.NonEmptyArray<T>;
    return [fallback()];
  };

export const fuzzyIndexSearch =
  <T>(needle: number, get: (i: T) => number) =>
  (items: NA.NonEmptyArray<T>): number => {
    if (needle < get(items[0])) return 0;
    if (needle > get(items[items.length - 1])) return items.length - 1;
    let [l, r] = [0, items.length - 1];
    while (l < r) {
      if (r - l == 1) {
        const ldiff = needle - get(items[l]);
        const rdiff = get(items[r]) - needle;
        if (ldiff <= rdiff) return l;
        return r;
      }
      const i = Math.trunc((l + r) / 2);
      if (needle == get(items[i])) {
        return i;
      }
      if (needle < get(items[i])) {
        r = i;
        continue;
      }
      l = i;
    }
    return l;
  };
