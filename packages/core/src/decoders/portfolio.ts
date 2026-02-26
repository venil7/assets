import * as t from "io-ts";
import { nonEmptyArray } from "io-ts-types";
import { dateDecoder } from "./util";
import { ChartDataPointDecoder } from "./yahoo/chart";
import { RangeDecoder } from "./yahoo/meta";
import { PeriodChangesDecoder, TotalsDecoder } from "./yahoo/period";

const basePortfolioTypes = {
  name: t.string,
  description: t.string
};

const extPortfolioTypes = {
  id: t.number,
  user_id: t.number,
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
  validRanges: t.array(RangeDecoder)
});

export const EnrichedPortfolioDecoder = t.type({
  ...extPortfolioTypes,
  meta: PortfolioMetaDecoder,
  currencies: t.array(t.string),
  weight: t.number,
  domestic: t.boolean,
  base: t.type({
    chart: nonEmptyArray(ChartDataPointDecoder),
    changes: PeriodChangesDecoder,
    invested: t.number,
    totals: TotalsDecoder,
    realizedGain: t.number,
    fxImpact: t.number
  })
});

export const EnrichedPortfoliosDecoder = t.array(EnrichedPortfolioDecoder);
