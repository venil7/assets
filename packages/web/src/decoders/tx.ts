import { PostTxDecoder, type PostTx } from "@darkruby/assets-core";
import * as t from "io-ts";
import { fromCsvBrowser } from "./csv";

export const CsvPostTxDecoder = fromCsvBrowser<PostTx>(
  PostTxDecoder as t.Type<PostTx>
);
