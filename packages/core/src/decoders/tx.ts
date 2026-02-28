import * as t from "io-ts";
import { BooleanFromNumber, withFallback } from "io-ts-types";
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
  quantity_ext: t.number, //signed, +buy, -sell
  stretch: t.number, // a series of txs all belonging to the same stretch untill sell all event
  final_stretch: BooleanFromNumber, // indicates last stretch
  value: nullableDecoder(t.number), // value of sold units
  pnl: nullableDecoder(t.number), // for buy txs of non final stretch
  pnl_pct: nullableDecoder(t.number), // return percent on sell
  realized_pnl: t.number, // only for sell transactions
  cost: t.number,
  cost_basis: t.number, // amount expressed in average  unit price
  contribution: t.number,
  // asset running values
  running_holding: t.number, // quantity owned after transaction
  running_cost: t.number, // total asset cost after this transaction
  running_average_price: t.number, //averga unit price, after this transaction
  running_break_even: t.number,
  running_contribution: t.number, //% showing max contribution of this stretch
  // from joined asset & portfolio & user
  asset_name: t.string,
  asset_ticker: t.string,
  portfolio_name: t.string,
  portfolio_description: t.string,
  user_id: t.number,
  user_base_ccy: CcyDecoder,
  // meta
  timestamp: UnixDateDecoder,
  created: dateDecoder,
  modified: dateDecoder
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
  // removing the nullables
  value: t.number,
  pnl: t.number,
  pnl_pct: t.number
});

export const EnrichedTxsDecoder = t.array(EnrichedTxDecoder);
