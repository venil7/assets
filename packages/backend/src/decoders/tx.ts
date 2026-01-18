import { PostTxDecoder, type PostTx } from "@darkruby/assets-core";
import * as t from "io-ts";
import { fromCsv } from "./csv";

export const CsvPostTxDecoder = fromCsv<PostTx>(
  PostTxDecoder as t.Type<PostTx>,
);
