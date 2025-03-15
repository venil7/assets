import * as t from "io-ts";
import type { GetTxDecoder, PostTxDecoder } from "../decoders/transaction";

export type PostTransaction = t.TypeOf<typeof PostTxDecoder>;
export type GetTransaction = t.TypeOf<typeof GetTxDecoder>;
export type TransactionType = GetTransaction["type"];
