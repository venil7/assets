import * as NA from "fp-ts/lib/NonEmptyArray";

export const nonEmpty = <T>(a: T[]): a is NA.NonEmptyArray<T> => a.length > 0;

export const onEmpty =
  <T>(fallback: () => T) =>
  (a: Array<T>): NA.NonEmptyArray<T> => {
    if (nonEmpty(a)) return a;
    return [fallback()];
  };

export type FuzzySearchStrategy =
  | "closest"
  | "left" // select lesser index on tie-breaking, staying within array index
  | "left-unsafe" //same, but may go beyond array index, returning -1
  | "right" // select greate index on tie-breaking, staying within array index
  | "right-unsafe"; //same, but may go beyond array index, returning length+1
export const fuzzyIndexSearch =
  <T>(getter: (i: T) => number, strategy: FuzzySearchStrategy = "closest") =>
  (needle: number) =>
  (items: NA.NonEmptyArray<T>): number => {
    const get = (idx: number) => getter(items[idx]);
    if (needle < get(0)) {
      return strategy == "left-unsafe" ? -1 : 0;
    }
    if (needle > get(items.length - 1)) {
      return strategy == "right-unsafe" ? items.length : items.length - 1;
    }
    let [l, r] = [0, items.length - 1];
    while (l < r) {
      if (r - l == 1) {
        if (get(r) == needle) return r;
        if (get(l) == needle) return l;
        switch (strategy) {
          case "left":
          case "left-unsafe":
            return l;
          case "right":
          case "right-unsafe":
            return r;
          case "closest": {
            const ldiff = needle - get(l);
            const rdiff = get(r) - needle;
            if (ldiff <= rdiff) return l;
            return r;
          }
        }
      }
      const i = Math.trunc((l + r) / 2);
      if (needle == get(i)) {
        return i;
      }
      if (needle < get(i)) {
        r = i;
        continue;
      }
      l = i;
    }
    return l;
  };
