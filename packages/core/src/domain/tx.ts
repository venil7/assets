import { fromUnixTime } from "date-fns";
import { pipe } from "fp-ts/lib/function";
import { contramap, reverse } from "fp-ts/lib/Ord";
import * as t from "io-ts";
import type {
  EnrichedTxDecoder,
  GetTxDecoder,
  PostTxDecoder,
  PostTxsUploadDecoder
} from "../decoders/tx";
import { fuzzyIndexSearch, nonEmpty } from "../utils/array";
import { DateOrd, unixTimestamp } from "../utils/date";
import type { Optional } from "../utils/utils";
import type { UnixDate } from "./date";

export const EARLIEST_TS = unixTimestamp(0);
export const EARLIEST_DATE = fromUnixTime(EARLIEST_TS);

export type PostTx = t.TypeOf<typeof PostTxDecoder>;
export type GetTx = t.TypeOf<typeof GetTxDecoder>;
export type TxType = GetTx["type"];
export type TxId = GetTx["id"];

export const TxTypes: { [K in TxType]: K } = { sell: "sell", buy: "buy" };

export type PostTxsUpload = t.TypeOf<typeof PostTxsUploadDecoder>;
export type EnrichedTx = t.TypeOf<typeof EnrichedTxDecoder>;

export const defaultTx = (type: PostTx["type"], date: Date): PostTx => ({
  date,
  quantity: 0,
  price: 0,
  comments: "",
  type
});

export const byDateAsc = pipe(
  DateOrd,
  contramap<Date, PostTx>((tx) => tx.date)
);
export const isBuy = (type: TxType) => type === TxTypes.buy;
export const isSell = (type: TxType) => !isBuy(type);

export const txBuy = <T extends { type: TxType }>({ type }: T) => isBuy(type);
export const txSell = <T extends { type: TxType }>(tx: T) => !txBuy(tx);

export const toKey = <T extends GetTx>(tx: T) =>
  `tx-${tx.id}-${tx.modified.getTime()}`;
export const toKeys = <T extends GetTx>(tx: T[]) => tx.map(toKey).join(`-`);

export const cloneTx = (tx: PostTx): PostTx => ({ ...tx, date: new Date() });

export const byDateDesc = pipe(byDateAsc, reverse);

export const defaultBuyTx = (date = new Date()): PostTx =>
  defaultTx(TxTypes.buy, date);
export const defaultSellTx = (date = new Date()): PostTx =>
  defaultTx(TxTypes.sell, date);

export const defaultTxsUpload = (
  txs: PostTx[] = [],
  replace = false
): PostTxsUpload => ({
  txs,
  replace
});

export const earliestTxBeforeTimestamp =
  (ts: UnixDate) =>
  <T extends GetTx>(txs: T[]): Optional<T> => {
    if (nonEmpty(txs)) {
      const fuzzyFindTxBeforeTimestamp = fuzzyIndexSearch<GetTx>(
        (tx) => tx.timestamp,
        "left-unsafe"
      );
      const idx = pipe(txs, fuzzyFindTxBeforeTimestamp(ts));
      return txs[idx];
    }
  };

export const txsAfterTimestamp =
  (ts: UnixDate) =>
  <T extends GetTx>(txs: T[]): T[] => {
    if (nonEmpty(txs)) {
      const fuzzyFindTxByTimestamp = fuzzyIndexSearch<GetTx>(
        (tx) => tx.timestamp,
        "right-unsafe"
      );
      return pipe(txs, fuzzyFindTxByTimestamp(ts), txs.slice.bind(txs));
    }
    return [];
  };
