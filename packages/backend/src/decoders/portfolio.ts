import {
  PostPortfolioDecoder,
  type PostPortfolio,
} from "@darkruby/assets-core";
import { fromCsv } from "./csv";

export const CsvPostPortfolioDecoder =
  fromCsv<PostPortfolio>(PostPortfolioDecoder);
