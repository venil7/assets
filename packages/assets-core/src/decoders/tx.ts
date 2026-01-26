import * as t from "io-ts";
import { withFallback } from "io-ts-types";
import { NumberDecoder } from "./number";
import { dateDecoder, nullableDecoder } from "./util";

const baseTxTypes = {
  type: t.union([t.literal("buy"), t.literal("sell")]),
  quantity: NumberDecoder,
  price: NumberDecoder,
  date: dateDecoder,
  comments: withFallback(t.string, "")
};

const extTxTypes = {
  ...baseTxTypes,
  id: t.number,
  asset_id: t.number,
  created: dateDecoder,
  modified: dateDecoder,
  holdings: t.number,
  total_invested: t.number,
  avg_price: nullableDecoder(t.number)
};

export const PostTxDecoder = t.type(baseTxTypes);
export const GetTxDecoder = t.type(extTxTypes);
export const GetTxsDecoder = t.array(GetTxDecoder);

export const PostTxsUploadDecoder = t.type({
  replace: t.boolean,
  txs: t.array(PostTxDecoder)
});

export const EnrichedTxDecoder = t.type({
  ...extTxTypes,
  ccy: t.type({
    cost: t.number,
    value: t.number,
    returnValue: t.number,
    returnPct: t.number
  }),
  base: t.type({
    cost: t.number,
    value: t.number,
    returnValue: t.number,
    returnPct: t.number,
    fxImpact: t.number
  })
});

export const EnrichedTxsDecoder = t.array(EnrichedTxDecoder);
