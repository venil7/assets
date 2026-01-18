import { PostTxDecoder, type PostTx } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { fromCsvBrowser } from "./csv";

export const CsvPostTxDecoder = pipe(
  fromCsvBrowser<PostTx>(PostTxDecoder as t.Type<PostTx>),
);
