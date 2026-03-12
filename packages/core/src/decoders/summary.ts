import * as t from "io-ts";
import { nonEmptyArray } from "io-ts-types";
import { PortfolioMetaDecoder } from "./portfolio";
import { ChartDataPointDecoder } from "./yahoo/chart";
import { PeriodChangesDecoder, TotalsDecoder } from "./yahoo/period";

const summaryTypes = {
  chart: nonEmptyArray(ChartDataPointDecoder),
  changes: PeriodChangesDecoder,
  totals: TotalsDecoder,
  meta: PortfolioMetaDecoder,
  invested: t.number,
  realizedPnl: t.number,
  breakEven: t.number,
  fxImpact: t.number
};

export const EnrichedSummaryDecoder = t.type(summaryTypes);
