import * as t from "io-ts";
import { dateDecoder } from "../util";

const periodChangesTypes = {
  beginning: t.number,
  current: t.number,
  change: t.number,
  changePct: t.number,
  date: dateDecoder,
  // date: nullableDecoder(dateDecoder),
};

const totalsTypes = {
  profitLoss: t.number,
  profitLossPct: t.number,
};

export const PeriodChangesDecoder = t.type(periodChangesTypes);
export const TotalsDecoder = t.type(totalsTypes);
