import * as t from "io-ts";
import type { Totals } from "../../domain";
import { UnixDateDecoder } from "../date";

const totalsTypes = {
  returnValue: t.number,
  returnPct: t.number
};

const periodChangesTypes = {
  ...totalsTypes,
  startPrice: t.number,
  endPrice: t.number,
  startTs: UnixDateDecoder,
  endTs: UnixDateDecoder
};

export const PeriodChangesDecoder = t.type(periodChangesTypes);
export const TotalsDecoder = t.type(totalsTypes);

export const defaultTotals = (): Totals => ({
  returnValue: 0,
  returnPct: 0
});
