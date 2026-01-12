import { byDateAsc, PostTxDecoder, type PostTx } from "@darkruby/assets-core";
import { mapDecoder1 } from "@darkruby/assets-core/src/decoders/util";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { fromCsvBrowser } from "./csv";

export const CsvPostTxDecoder = pipe(
  fromCsvBrowser<PostTx>(PostTxDecoder as t.Type<PostTx>) as any as t.Type<
    PostTx[]
  >,
  mapDecoder1((txs) => pipe(txs, A.sort(byDateAsc), E.of))
);
