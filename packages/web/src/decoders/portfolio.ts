import {
  PostPortfolioDecoder,
  type PostPortfolio,
} from "@darkruby/assets-core";
import { fromCsvBrowser } from "./csv";

export const CsvPostPortfolioDecoder =
  fromCsvBrowser<PostPortfolio>(PostPortfolioDecoder);
