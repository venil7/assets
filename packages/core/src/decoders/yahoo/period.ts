import * as t from "io-ts";
import type { Totals } from "../../domain";
import { UnixDateDecoder } from "../date";

const totalsTypes = {
  returnValue: t.number,
  returnPct: t.number
};

const periodChangesTypes = {
  ...totalsTypes,
  beginning: t.number,
  current: t.number,
  start: UnixDateDecoder,
  end: UnixDateDecoder
};

export const PeriodChangesDecoder = t.type(periodChangesTypes);
export const TotalsDecoder = t.type(totalsTypes);

export const defaultTotals = (): Totals => ({
  returnValue: 0,
  returnPct: 0
});
