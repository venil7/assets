import * as t from "io-ts";
import { dateDecoder, nullableDecoder } from "./util";

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
  portfolio_contribution: nullableDecoder(t.number),
};

export const PostAssetDecoder = t.type(baseAssetTypes);
export const GetAssetDecoder = PostAssetDecoder.pipe(t.type(extAssetTypes));
export const GetAssetsDecoder = t.array(GetAssetDecoder);
