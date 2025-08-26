import * as t from "io-ts";
import { dateDecoder, nonEmptyArray, nullableDecoder } from "./util";

import { ChartDataPointDecoder } from "./yahoo/chart";
import { ChartMetaDecoder } from "./yahoo/meta";
import { PeriodChangesDecoder, TotalsDecoder } from "./yahoo/period";

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
  num_txs: t.number,
  avg_price: nullableDecoder(t.number),
  portfolio_contribution: t.number,
};

export const PostAssetDecoder = t.type(baseAssetTypes);
export const GetAssetDecoder = PostAssetDecoder.pipe(t.type(extAssetTypes));
export const GetAssetsDecoder = t.array(GetAssetDecoder);

export const EnrichedAssetDecoder = t.type({
  ...extAssetTypes,
  meta: ChartMetaDecoder,
  chart: t.type({
    ccy: nonEmptyArray(ChartDataPointDecoder),
    base: nonEmptyArray(ChartDataPointDecoder),
  }),
  investedBase: t.number,
  value: t.type({
    ccy: PeriodChangesDecoder,
    base: PeriodChangesDecoder,
    weight: t.number,
    baseRate: t.number,
  }),
  totals: t.type({
    ccy: TotalsDecoder,
    base: TotalsDecoder,
  }),
});

export const EnrichedAssetsDecoder = t.array(EnrichedAssetDecoder);
