import * as t from "io-ts";
import { dateDecoder } from "./util";

const baseTxTypes = {
  type: t.union([t.literal("buy"), t.literal("sell")]),
  quantity: t.number,
  price: t.number,
  date: dateDecoder,
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
