import * as t from "io-ts";
import { nullableDecoder } from "./util";

import { nonEmptyArray } from "io-ts-types";
import { dateDecoder } from "./date";
import { NumberDecoder } from "./number";
import { CcyDecoder } from "./prefs";
import { UserIdDecoder } from "./user";
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
  user_id: UserIdDecoder,
  holdings: t.number,
  invested: t.number,
  avg_price: t.number,
  break_even: t.number,
  realized_pnl: t.number,
  num_txs: t.number,
  last_activity: nullableDecoder(dateDecoder),
  last_activity_ts: nullableDecoder(NumberDecoder),
  base_ccy: CcyDecoder,
  created: dateDecoder,
  modified: dateDecoder
};

export const PostAssetDecoder = t.type(baseAssetTypes);
export const GetAssetDecoder = PostAssetDecoder.pipe(t.type(extAssetTypes));
export const GetAssetsDecoder = t.array(GetAssetDecoder);

export const EnrichedAssetDecoder = t.type({
  ...extAssetTypes,
  meta: ChartMetaDecoder,
  // mktFxRate: t.number,
  weight: nullableDecoder(t.number),
  volatilityRange: t.number,
  volatilityPct: t.number,
  ccy: t.type({
    chart: nonEmptyArray(ChartDataPointDecoder),
    changes: PeriodChangesDecoder,
    totals: TotalsDecoder
  }),
  base: t.type({
    domestic: t.boolean, // is denominated in base ccy?
    invested: t.number,
    fxImpact: t.number,
    fxRate: t.number,
    chart: nonEmptyArray(ChartDataPointDecoder),
    changes: PeriodChangesDecoder,
    totals: TotalsDecoder,
    avgPrice: nullableDecoder(t.number),
    breakEven: nullableDecoder(t.number),
    realizedPnl: t.number
  })
});

export const EnrichedAssetsDecoder = t.array(EnrichedAssetDecoder);
