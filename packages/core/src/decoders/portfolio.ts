import * as t from "io-ts";
import { dateDecoder } from "./date";
import { UserIdDecoder } from "./user";
import { nullableDecoder } from "./util";
import { ChartDataDecoder, MultiChartDataDecoder } from "./yahoo/chart";
import { RangeDecoder } from "./yahoo/meta";
import { PeriodChangesDecoder, TotalsDecoder } from "./yahoo/period";

const basePortfolioTypes = {
  name: t.string,
  description: t.string
};

const extPortfolioTypes = {
  id: t.number,
  user_id: UserIdDecoder,
  ...basePortfolioTypes,
  num_assets: t.number,
  created: dateDecoder,
  modified: dateDecoder
};

export const PostPortfolioDecoder = t.type(basePortfolioTypes);
export const GetPortfolioDecoder = t.type(extPortfolioTypes);
export const GetPortfoliosDecoder = t.array(GetPortfolioDecoder);

export const PortfolioMetaDecoder = t.type({
  range: RangeDecoder,
  validRanges: t.array(RangeDecoder),
  volatilityRange: t.number,
  volatilityPct: t.number,
  currencies: t.array(t.string),
  exchanges: t.array(t.string),
  types: t.array(t.string),
  fiftyTwoWeekHigh: t.number,
  fiftyTwoWeekLow: t.number
});

export const EnrichedPortfolioDecoder = t.type({
  ...extPortfolioTypes,
  meta: PortfolioMetaDecoder,
  weight: nullableDecoder(t.number),
  domestic: t.boolean,
  chart: ChartDataDecoder,
  multiChart: MultiChartDataDecoder,
  changes: PeriodChangesDecoder,
  totals: TotalsDecoder,
  invested: t.number,
  realizedPnl: t.number,
  breakEven: t.number,
  fxImpact: t.number
});

export const EnrichedPortfoliosDecoder = t.array(EnrichedPortfolioDecoder);
