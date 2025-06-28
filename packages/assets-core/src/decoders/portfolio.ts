import * as t from "io-ts";
import { dateDecoder, nonEmptyArray } from "./util";
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
export const GetPortfolioDecoder = PostPortfolioDecoder.pipe(
  t.type(extPortfolioTypes)
);
export const GetPortfoliosDecoder = t.array(GetPortfolioDecoder);

export const EnrichedPortfolioDecoder = t.type({
  ...extPortfolioTypes,
  chart: nonEmptyArray(ChartDataPointDecoder),
  value: PeriodChangesDecoder,
  weight: t.number,
  investedBase: t.number,
  totals: TotalsDecoder,
  meta: t.type({
    range: RangeDecoder,
    validRanges: t.array(RangeDecoder),
  }),
});

export const EnrichedPortfoliosDecoder = t.array(EnrichedPortfolioDecoder);
