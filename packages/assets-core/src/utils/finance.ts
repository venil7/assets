import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as M from "fp-ts/lib/Monoid";

export type ChangeInParams = { before: number; after: number };
export const changeInValue = ({ before, after }: ChangeInParams): number =>
  after - before;
export const changeInPct = ({ before, after }: ChangeInParams): number =>
  before == 0 ? 0 : (after - before) / before;

export const change = ({
  before,
  after
}: ChangeInParams): [value: number, pct: number] => [
  changeInValue({ before, after }),
  changeInPct({ before, after })
];

export const pctOf = (whole: number, frac: number): number =>
  whole > 0 ? frac / whole : 0;

export const sumMonoid: M.Monoid<number> = {
  empty: 0,
  concat: (a, b) => a + b
};

export const sum = A.foldMap(sumMonoid);
export const avg =
  <A>(f: (a: A) => number) =>
  (fa: A[]) =>
    pipe(fa, sum(f)) / fa.length;
