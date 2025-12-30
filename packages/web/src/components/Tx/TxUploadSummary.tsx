import { ccyToLocale, type Ccy, type PostTx } from "@darkruby/assets-core";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import { withCondition } from "../../decorators/nodata";
import { money } from "../../util/number";
import { Dark } from "../Form/Alert";

export type TxUploadSummaryProps = {
  txs: PostTx[];
  currency: Ccy;
};

const RawTxUploadSummary: React.FC<TxUploadSummaryProps> = ({
  txs,
  currency,
}) => {
  const locale = ccyToLocale(currency);
  const { left: buys, right: sells } = pipe(
    txs,
    A.partition((t) => t.type == "sell")
  );
  const buysTotal = A.reduce<PostTx, number>(
    0,
    (a, t) => a + t.price * t.quantity
  )(buys);
  const sellsTotal = A.reduce<PostTx, number>(
    0,
    (a, t) => a - t.price * t.quantity
  )(sells);

  return (
    <Dark>
      Total {txs.length} transactions, {buys.length} buys (
      {money(buysTotal, currency, locale)}), {sells.length} sells (
      {money(sellsTotal, currency, locale)}), net{" "}
      {money(buysTotal + sellsTotal, currency, locale)}
    </Dark>
  );
};

export const TxUploadSummary = pipe(
  RawTxUploadSummary,
  withCondition(
    (p) => !!p.txs.length,
    () => null
  )
);
