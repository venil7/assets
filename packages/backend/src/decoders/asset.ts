import { PostAssetDecoder, type PostAsset } from "@darkruby/assets-core";
import { fromCsv } from "./csv";

export const CsvPostAssetDecoder = fromCsv<PostAsset>(PostAssetDecoder);
