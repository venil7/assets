import * as t from "io-ts";

const periodChangesTypes = {
  beginning: t.number,
  current: t.number,
  change: t.number,
  changePct: t.number,
  start: t.number, //represnets date
  end: t.number, //represnets date
};

const totalsTypes = {
  profitLoss: t.number,
  profitLossPct: t.number,
};

export const PeriodChangesDecoder = t.type(periodChangesTypes);
export const TotalsDecoder = t.type(totalsTypes);
