import * as t from "io-ts";
import { dateDecoder } from "./util";
import { PeriodValueDecoder } from "./yahoo/period";

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
};

export const PostPortfolioDecoder = t.type(basePortfolioTypes);
export const GetPortfolioDecoder = PostPortfolioDecoder.pipe(
  t.type(extPortfolioTypes)
);
export const GetPortfoliosDecoder = t.array(GetPortfolioDecoder);

export const EnrichedPortfolioDecoder = t.type({
  ...extPortfolioTypes,
  // price: PeriodPriceDecoder,
  value: PeriodValueDecoder,
});

export const EnrichedPortfoliosDecoder = t.array(EnrichedPortfolioDecoder);
