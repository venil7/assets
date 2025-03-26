import * as t from "io-ts";
import { dateDecoder, nullableDecoder } from "../util";

const periodPriceTypes = {
  periodStartPrice: t.number,
  periodEndPrice: t.number,
  periodChangePct: t.number,
  periodChange: t.number,
  lastUpdated: nullableDecoder(dateDecoder),
};

const periodValueTypes = {
  profitLoss: t.number,
  periodStartValue: t.number,
  periodEndValue: t.number,
};

export const PeriodPriceDecoder = t.type(periodPriceTypes);
export const PeriodValueDecoder = t.type(periodValueTypes);
