import * as t from "io-ts";
import type {
  GetPortfolioDecoder,
  PostPortfolioDecoder,
} from "../decoders/portfolio";

export type PostPortfolio = t.TypeOf<typeof PostPortfolioDecoder>;
export type GetPortfolio = t.TypeOf<typeof GetPortfolioDecoder>;
