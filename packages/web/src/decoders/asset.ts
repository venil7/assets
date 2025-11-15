import { PostAssetDecoder, type PostAsset } from "@darkruby/assets-core";
import { fromCsvBrowser } from "./csv";

export const CsvPostAssetDecoder = fromCsvBrowser<PostAsset>(PostAssetDecoder);
