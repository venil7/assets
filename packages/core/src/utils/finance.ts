import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as M from "fp-ts/lib/Monoid";
import type { Totals } from "../domain";

type ChangeInParams = { before: number; after: number };
const changeInValue = ({ before, after }: ChangeInParams): number =>
  after - before;
const changeInPct = ({ before, after }: ChangeInParams): number =>
  before == 0 ? 0 : (after - before) / before;

export const calcPnl = ({
  before,
  after
}: ChangeInParams): [value: number, pct: number] =>
  [changeInValue({ before, after }), changeInPct({ before, after })] as const;

export const invested = ({ returnValue, returnPct }: Totals) => {
  if (!returnPct) return returnValue;
  return returnValue / returnPct;
};

export const volatility = (
  before: number,
  after: number
): [range: number, pct: number] => {
  const volatilityValue = Math.abs(before - after);
  const denominator = (before + after) / 2;
  const volatilityPct = denominator ? volatilityValue / denominator : 0;
  return [volatilityValue, volatilityPct] as const;
};

export const pctOf = (whole: number, frac: number): number =>
  whole != 0 ? frac / whole : 0;

export const sumMonoid: M.Monoid<number> = {
  empty: 0,
  concat: (a, b) => a + b
};

export const sum = A.foldMap(sumMonoid);

export const unique =
  <A, R extends string | number>(f: (a: A) => R) =>
  (as: A[]): Array<R> =>
    pipe(new Set<R>(as.map(f)).values(), Array.from<R>);

export const uniques =
  <A, R extends string | number>(f: (a: A) => R[]) =>
  (as: A[]): Array<R> =>
    pipe(
      as,
      A.map(f),
      A.flatten,
      (items) => new Set<R>(items).values(),
      Array.from<R>
    );

export const avg =
  <A>(f: (a: A) => number) =>
  (as: A[]) =>
    pipe(as, sum(f)) / as.length;

export const calcCumulativePnl =
  <A, T extends Totals = Totals>(getter: (a: A) => T) =>
  (as: A[]) => {
    const totals = pipe(as, A.map(getter));
    const totalInvested = pipe(totals, sum(invested));
    const returnValue = pipe(
      totals,
      sum((t) => t.returnValue)
    );
    const returnPct = returnValue / totalInvested;
    if (!totalInvested) return [0, 0] as const;
    return [returnValue, returnPct] as const;
  };
