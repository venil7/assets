import type { EnrichedPortfolio } from "./portfolio";
import type { ChartData, PeriodChanges, Totals } from "./yahoo";

export type Summary = {
  chart: ChartData;
  value: PeriodChanges;
  totals: Totals;
  meta: EnrichedPortfolio["meta"];
};
