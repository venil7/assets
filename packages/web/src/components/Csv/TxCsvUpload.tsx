import type { PostTx } from "@darkruby/assets-core";
import { liftE } from "@darkruby/assets-core/src/decoders/util";
import { pipe } from "fp-ts/lib/function";
import { CsvPostTxDecoder } from "../../decoders/tx";
import { withProps } from "../../decorators/props";
import { CsvUpload } from "./CsvUpload";

export const TxCsvUpload = pipe(
  CsvUpload<PostTx>,
  withProps({ decode: liftE(CsvPostTxDecoder) })
);
