import * as t from "io-ts";
import { nonEmptyArray } from "io-ts-types";
import { dateDecoder } from "./util";
import { ChartDataPointDecoder } from "./yahoo/chart";
import { RangeDecoder } from "./yahoo/meta";
import { PeriodChangesDecoder, TotalsDecoder } from "./yahoo/period";

const basePortfolioTypes = {
  name: t.string,
  description: t.string,
};

const extPortfolioTypes = {
  id: t.number,
  user_id: t.number,
  ...basePortfolioTypes,
  created: dateDecoder,
  modified: dateDecoder,
  total_invested: t.number,
  num_assets: t.number,
  contribution: t.number,
};

export const PostPortfolioDecoder = t.type(basePortfolioTypes);
export const GetPortfolioDecoder = t.type(extPortfolioTypes);
export const GetPortfoliosDecoder = t.array(GetPortfolioDecoder);

export const PortfolioMetaDecoder = t.type({
  range: RangeDecoder,
  validRanges: t.array(RangeDecoder),
});

export const EnrichedPortfolioDecoder = t.type({
  ...extPortfolioTypes,
  chart: nonEmptyArray(ChartDataPointDecoder),
  value: PeriodChangesDecoder,
  weight: t.number,
  investedBase: t.number,
  totals: TotalsDecoder,
  meta: PortfolioMetaDecoder,
});

export const EnrichedPortfoliosDecoder = t.array(EnrichedPortfolioDecoder);
