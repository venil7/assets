import type { Refinement } from "fp-ts/lib/Refinement";
import * as t from "io-ts";

export const UnixDateDecoder = t.brand(
  t.number,
  ((a) => a >= 0 && a == Math.floor(a)) as Refinement<
    number,
    t.Branded<number, { readonly UnixDate: symbol }>
  >,
  "UnixDate"
);

const totalsTypes = {
  returnValue: t.number,
  returnPct: t.number
};

const periodChangesTypes = {
  beginning: t.number,
  current: t.number,
  ...totalsTypes,
  start: UnixDateDecoder,
  end: UnixDateDecoder
};

export const PeriodChangesDecoder = t.type(periodChangesTypes);
export const TotalsDecoder = t.type(totalsTypes);
