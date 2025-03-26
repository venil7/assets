import { max } from "date-fns";
import * as M from "fp-ts/lib/Monoid";

export const LatestDateMonoid: M.Monoid<Date> = {
  empty: new Date(0),
  concat: (a, b) => max([a, b]),
};
