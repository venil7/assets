import * as t from "io-ts";
import { PortfolioMetaDecoder } from "./portfolio";
import { ChartDataDecoder } from "./yahoo/chart";
import { PeriodChangesDecoder, TotalsDecoder } from "./yahoo/period";

const summaryTypes = {
  numPortfolios: t.number,
  chart: ChartDataDecoder,
  // multiChart: MultiChartDataDecoder,
  changes: PeriodChangesDecoder,
  totals: TotalsDecoder,
  meta: PortfolioMetaDecoder,
  invested: t.number,
  realizedPnl: t.number,
  breakEven: t.number,
  fxImpact: t.number
};

export const EnrichedSummaryDecoder = t.type(summaryTypes);
