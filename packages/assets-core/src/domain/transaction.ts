import { pipe } from "fp-ts/lib/function";
import { contramap } from "fp-ts/lib/Ord";
import * as t from "io-ts";
import type {
  GetTxDecoder,
  PostTxDecoder,
  PostTxsUploadDecoder,
} from "../decoders/transaction";
import { DateOrd } from "../utils/date";

export type PostTx = t.TypeOf<typeof PostTxDecoder>;
export type GetTx = t.TypeOf<typeof GetTxDecoder>;
export type TxType = GetTx["type"];
export type TxId = GetTx["id"];

export type PostTxsUpload = t.TypeOf<typeof PostTxsUploadDecoder>;

export const defaultTx = (type: PostTx["type"] = "buy"): PostTx => ({
  date: new Date(),
  quantity: 0,
  price: 0,
  comments: "",
  type,
});

export const byDate = pipe(
  DateOrd,
  contramap<Date, PostTx>((tx) => tx.date)
);

export const defaultBuyTx = (): PostTx => defaultTx("buy");
export const defaultSellTx = (): PostTx => defaultTx("sell");

export const defaultTxsUpload = (): PostTxsUpload => ({
  txs: [],
  replace: false,
});
