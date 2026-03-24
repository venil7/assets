import { getUnixTime, max } from "date-fns";
import * as A from "fp-ts/lib/Array";
import * as M from "fp-ts/lib/Monoid";
import type { Ord } from "fp-ts/lib/Ord";
import { identity, pipe } from "fp-ts/lib/function";
import * as N from "fp-ts/lib/number";
import { Ord as NumberOrd } from "fp-ts/lib/number";
import type { UnixDate } from "../domain";
import { onEmpty } from "./array";

export const LatestDateMonoid: M.Monoid<Date> = {
  empty: new Date(0),
  concat: (a, b) => max([a, b])
};

export const DateOrd: Ord<Date> = {
  compare: (x: Date, y: Date) => NumberOrd.compare(x.getTime(), y.getTime()),
  equals: (x: Date, y: Date) => NumberOrd.equals(x.getTime(), y.getTime())
};

export const now = () => new Date();
export const unixNow = () => getUnixTime(now()) as UnixDate;

export const unixTimestamp = (i: number) => Math.floor(Math.abs(i)) as UnixDate;
export const epoch = () => unixTimestamp(0);

export const minTs =
  <A>(getter: (t: A) => UnixDate) =>
  (as: A[]) => {
    return pipe(
      as,
      A.map(getter),
      onEmpty(epoch),
      A.foldMap(M.min(N.Bounded))(identity)
    );
  };

export const maxTs =
  <A>(getter: (t: A) => UnixDate) =>
  (as: A[]) => {
    return pipe(
      as,
      A.map(getter),
      onEmpty(unixNow),
      A.foldMap(M.max(N.Bounded))(identity)
    );
  };
