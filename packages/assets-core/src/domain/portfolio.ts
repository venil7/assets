import * as t from "io-ts";
import type {
  EnrichedPortfolioDecoder,
  GetPortfolioDecoder,
  PostPortfolioDecoder,
} from "../decoders/portfolio";

export type PostPortfolio = t.TypeOf<typeof PostPortfolioDecoder>;
export type GetPortfolio = t.TypeOf<typeof GetPortfolioDecoder>;

export type EnrichedPortfolio = t.TypeOf<typeof EnrichedPortfolioDecoder>;
