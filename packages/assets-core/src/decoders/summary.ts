import * as t from "io-ts";
import { nonEmptyArray } from "io-ts-types";
import { PortfolioMetaDecoder } from "./portfolio";
import { ChartDataPointDecoder } from "./yahoo/chart";
import { PeriodChangesDecoder, TotalsDecoder } from "./yahoo/period";

const summaryTypes = {
  chart: nonEmptyArray(ChartDataPointDecoder),
  value: PeriodChangesDecoder,
  totals: TotalsDecoder,
  meta: PortfolioMetaDecoder,
};

export const SummaryDecoder = t.type(summaryTypes);
