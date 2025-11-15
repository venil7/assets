import * as t from "io-ts";
import { withFallback } from "io-ts-types";
import { NumberDecoder } from "./number";
import { dateDecoder } from "./util";

const baseTxTypes = {
  type: t.union([t.literal("buy"), t.literal("sell")]),
  quantity: NumberDecoder,
  price: NumberDecoder,
  date: dateDecoder,
  comments: withFallback(t.string, ""),
};

const extTxTypes = {
  ...baseTxTypes,
  id: t.number,
  asset_id: t.number,
  created: dateDecoder,
  modified: dateDecoder,
};

export const PostTxDecoder = t.type(baseTxTypes);
export const GetTxDecoder = t.type(extTxTypes);
export const GetTxsDecoder = t.array(GetTxDecoder);
