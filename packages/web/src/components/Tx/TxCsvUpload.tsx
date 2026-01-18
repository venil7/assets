import { byDateAsc, type PostTx } from "@darkruby/assets-core";
import { liftE } from "@darkruby/assets-core/src/decoders/util";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import { flow, pipe } from "fp-ts/lib/function";
import { CsvPostTxDecoder } from "../../decoders/tx";
import { withProps } from "../../decorators/props";
import { CsvUpload } from "../Csv/CsvUpload";

const decode =  flow(liftE(CsvPostTxDecoder), E.map(A.sort(byDateAsc)))

export const TxCsvUpload = pipe(
  CsvUpload<PostTx>,
  withProps({ decode  })
);
