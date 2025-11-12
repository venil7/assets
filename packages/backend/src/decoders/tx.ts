import { PostTxDecoder, type PostTx } from "@darkruby/assets-core";
import { fromCsv } from "./csv";

export const CsvPostTxDecoder = fromCsv<PostTx>(PostTxDecoder);
