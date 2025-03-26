import * as t from "io-ts";
import { dateDecoder, nonEmptyArray, nullableDecoder } from "./util";

import { ChartDataPointDecoder } from "./yahoo/chart";
import { ChartMetaDecoder } from "./yahoo/meta";
import { PeriodPriceDecoder, PeriodValueDecoder } from "./yahoo/period";

const baseAssetTypes = {
  ticker: t.string,
  name: t.string,
};

const extAssetTypes = {
  id: t.number,
  portfolio_id: t.number,
  ...baseAssetTypes,
  created: dateDecoder,
  modified: dateDecoder,
  holdings: t.number,
  invested: t.number,
  avg_price: nullableDecoder(t.number),
  portfolio_contribution: t.number,
};

export const PostAssetDecoder = t.type(baseAssetTypes);
export const GetAssetDecoder = PostAssetDecoder.pipe(t.type(extAssetTypes));
export const GetAssetsDecoder = t.array(GetAssetDecoder);

export const EnrichedAssetDecoder = t.type({
  ...extAssetTypes,
  meta: ChartMetaDecoder,
  chart: nonEmptyArray(ChartDataPointDecoder),
  price: PeriodPriceDecoder,
  value: PeriodValueDecoder,
});

export const EnrichedAssetsDecoder = t.array(EnrichedAssetDecoder);
