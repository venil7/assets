import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as M from "fp-ts/lib/Monoid";
import * as N from "fp-ts/lib/number";

type ChangeInParams = { before: number; after: number };
export const changeInValue = ({ before, after }: ChangeInParams): number =>
  after - before;
export const changeInPct = ({ before, after }: ChangeInParams): number =>
  before == 0 ? 0 : (after - before) / before;

export const change = ({
  before,
  after
}: ChangeInParams): [value: number, pct: number] =>
  [changeInValue({ before, after }), changeInPct({ before, after })] as const;

export const volatility = (
  before: number,
  after: number
): [range: number, pct: number] => {
  const volatilityValue = Math.abs(before - after);
  return [volatilityValue, volatilityValue / ((before + after) / 2)] as const;
};

export const pctOf = (whole: number, frac: number): number =>
  whole != 0 ? frac / whole : 0;

export const sumMonoid: M.Monoid<number> = {
  empty: 0,
  concat: (a, b) => a + b
};

export const sum = A.foldMap(sumMonoid);
export const min = A.foldMap(M.min(N.Bounded));
export const max = A.foldMap(M.max(N.Bounded));
export const unique =
  <A, R extends string | number>(f: (a: A) => R) =>
  (as: A[]): Array<R> =>
    pipe(new Set<R>(as.map(f)).values(), Array.from<R>);

export const avg =
  <A>(f: (a: A) => number) =>
  (as: A[]) =>
    pipe(as, sum(f)) / as.length;
