import * as t from "io-ts";
import type { GetTxDecoder, PostTxDecoder } from "../decoders/transaction";

export type PostTx = t.TypeOf<typeof PostTxDecoder>;
export type GetTx = t.TypeOf<typeof GetTxDecoder>;
export type TxType = GetTx["type"];
export type TxId = GetTx["id"];

export const defaultBuyTx = (): PostTx => ({
  date: new Date(),
  quantity: 0,
  price: 0,
  comments: "",
  type: "buy",
});
