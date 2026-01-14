import { pipe } from "fp-ts/lib/function";
import { contramap, reverse } from "fp-ts/lib/Ord";
import * as t from "io-ts";
import type {
  EnrichedTxDecoder,
  GetTxDecoder,
  PostTxDecoder,
  PostTxsUploadDecoder,
} from "../decoders/tx";
import { DateOrd } from "../utils/date";

export const EARLIEST_DATE = new Date(0);

export type PostTx = t.TypeOf<typeof PostTxDecoder>;
export type GetTx = t.TypeOf<typeof GetTxDecoder>;
export type TxType = GetTx["type"];
export type TxId = GetTx["id"];

export type PostTxsUpload = t.TypeOf<typeof PostTxsUploadDecoder>;
export type EnrichedTx = t.TypeOf<typeof EnrichedTxDecoder>;

export const defaultTx = (type: PostTx["type"], date: Date): PostTx => ({
  date,
  quantity: 0,
  price: 0,
  comments: "",
  type,
});

export const byDateAsc = pipe(
  DateOrd,
  contramap<Date, PostTx>((tx) => tx.date)
);

export const byDateDesc = pipe(byDateAsc, reverse);

export const defaultBuyTx = (date = new Date()): PostTx =>
  defaultTx("buy", date);
export const defaultSellTx = (date = new Date()): PostTx =>
  defaultTx("sell", date);

export const defaultTxsUpload = (
  txs: PostTx[] = [],
  replace = false
): PostTxsUpload => ({
  txs,
  replace,
});
