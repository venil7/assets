import * as t from "io-ts";
import { withFallback } from "io-ts-types";
import { UnixDateDecoder } from "./date";
import { NumberDecoder } from "./number";
import { CcyDecoder } from "./prefs";
import { dateDecoder, nullableDecoder } from "./util";

export const TxTypeDecoder = t.union([t.literal("buy"), t.literal("sell")]);

const baseTxTypes = {
  type: TxTypeDecoder,
  quantity: NumberDecoder,
  price: NumberDecoder,
  date: dateDecoder,
  comments: withFallback(t.string, "")
};

const extTxTypes = {
  ...baseTxTypes,
  id: t.number,
  asset_id: t.number,
  timestamp: UnixDateDecoder,
  quantity_ext: t.number, //signed, +buy, -sell
  cost: t.number,
  contribution: t.number,
  stretch: t.number, // a series of txs all belonging to the same stretch untill sell all event
  running_holding: t.number, // quantity owned after transaction
  running_cost: t.number, // total asset cost after this transaction
  running_average_price: t.number, //averga unit price, after this transaction
  cost_basis: t.number, // amount expressed in average  unit price
  running_break_even: t.number,
  realized_pnl: t.number, //only for sell transactions
  asset_name: t.string,
  asset_ticker: t.string,
  portfolio_name: t.string,
  portfolio_description: t.string,
  user_id: t.number,
  created: dateDecoder,
  modified: dateDecoder,
  user_base_ccy: CcyDecoder
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
    fxRate: t.number,
    returnValue: t.number,
    returnPct: t.number,
    fxImpact: nullableDecoder(t.number)
  })
});

export const EnrichedTxsDecoder = t.array(EnrichedTxDecoder);
