import { ccyToLocale, type Ccy, type PostTx } from "@darkruby/assets-core";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import { withCondition } from "../../decorators/nodata";
import { withProps } from "../../decorators/props";
import { moneyFormatter } from "../../util/number";
import { Dark } from "../Form/Alert";
import { HelpTip } from "../Tooltip/HelpTip";

export type TxUploadSummaryProps = {
  txs: PostTx[];
  currency: Ccy;
};

const RawTxUploadSummary: React.FC<TxUploadSummaryProps> = ({
  txs,
  currency,
}) => {
  const locale = ccyToLocale(currency);
  const money = moneyFormatter(currency, locale);
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
      Total {txs.length} transactions, {buys.length} buys ({money(buysTotal)}),{" "}
      {sells.length} sells ({money(sellsTotal)}), net &nbsp;
      {money(buysTotal + sellsTotal)}
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

const columns = [
  ["type", "buy|sell"],
  ["quantity", "number"],
  ["price", "number"],
  ["date", "ISO date"],
  ["comments", "string"],
];

const TxUploadCsvFormat = () => (
  <table>
    {columns.map(([a, b]) => (
      <tr>
        <th>{a}</th>
        <td>{b}</td>
      </tr>
    ))}
  </table>
);

export const TxUploadFormatTip = pipe(
  HelpTip,
  withProps({
    label: "CSV format",
    text: <TxUploadCsvFormat />,
  })
);
