import * as A from "fp-ts/lib/Array";
import * as M from "fp-ts/lib/Monoid";

export const changeInValue = (before: number) => (after: number) =>
  after - before;
export const changeInValuePct = (before: number) => (after: number) =>
  before == 0 ? 0 : ((after - before) / before) * 100;

export const sumMonoid: M.Monoid<number> = {
  empty: 0,
  concat: (a, b) => a + b,
};

export const sum = A.foldMap(sumMonoid);
