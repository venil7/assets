import * as t from "io-ts";
import { dateDecoder } from "./util";

const basePortfolioTypes = {
  name: t.string,
  description: t.string,
};

const extPortfolioTypes = {
  id: t.number,
  user_id: t.number,
  ...basePortfolioTypes,
  created: dateDecoder,
  modified: dateDecoder,
  total_invested: t.number,
  num_assets: t.number,
};

export const PostPortfolioDecoder = t.type(basePortfolioTypes);
export const GetPortfolioDecoder = PostPortfolioDecoder.pipe(
  t.type(extPortfolioTypes)
);
export const GetPortfoliosDecoder = t.array(GetPortfolioDecoder);
