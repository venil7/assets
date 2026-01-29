import * as t from "io-ts";
import { dateDecoder, nullableDecoder } from "./util";

import { nonEmptyArray } from "io-ts-types";
import { CcyDecoder } from "./prefs";
import { ChartDataPointDecoder } from "./yahoo/chart";
import { ChartMetaDecoder } from "./yahoo/meta";
import { PeriodChangesDecoder, TotalsDecoder } from "./yahoo/period";

const baseAssetTypes = {
  ticker: t.string,
  name: t.string
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
  base_ccy: CcyDecoder,
  portfolio_contribution: t.number
};

export const PostAssetDecoder = t.type(baseAssetTypes);
export const GetAssetDecoder = PostAssetDecoder.pipe(t.type(extAssetTypes));
export const GetAssetsDecoder = t.array(GetAssetDecoder);

export const EnrichedAssetDecoder = t.type({
  ...extAssetTypes,
  meta: ChartMetaDecoder,
  mktBaseRate: t.number,
  weight: nullableDecoder(t.number),
  domestic: t.boolean, // if denominated in non base ccy
  ccy: t.type({
    chart: nonEmptyArray(ChartDataPointDecoder),
    changes: PeriodChangesDecoder,
    totals: TotalsDecoder,
    realizedGain: t.number,
    realizedGainPct: t.number
  }),
  base: t.type({
    invested: t.number,
    fxImpact: t.number,
    chart: nonEmptyArray(ChartDataPointDecoder),
    changes: PeriodChangesDecoder,
    totals: TotalsDecoder,
    avgBuyRate: t.number,
    avgPrice: nullableDecoder(t.number),
    realizedGain: t.number,
    realizedGainPct: t.number
  })
});

export const EnrichedAssetsDecoder = t.array(EnrichedAssetDecoder);
