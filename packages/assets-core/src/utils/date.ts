import { max } from "date-fns";
import * as M from "fp-ts/lib/Monoid";
import type { Ord } from "fp-ts/lib/Ord";
import { Ord as NumberOrd } from "fp-ts/lib/number";

export const LatestDateMonoid: M.Monoid<Date> = {
  empty: new Date(0),
  concat: (a, b) => max([a, b]),
};

export const DateOrd: Ord<Date> = {
  compare: (x: Date, y: Date) => NumberOrd.compare(x.getTime(), y.getTime()),
  equals: (x: Date, y: Date) => NumberOrd.equals(x.getTime(), y.getTime()),
};
