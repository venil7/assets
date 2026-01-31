import {
  cloneTx,
  type Ccy,
  type EnrichedAsset,
  type EnrichedTx,
  type PostTx
} from "@darkruby/assets-core";
import classNames from "classnames";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { withCondition } from "../../decorators/nodata";
import { withProps } from "../../decorators/props";
import { useFormatters } from "../../hooks/prefs";
import { isoTimestamp } from "../../util/date";
import { Dark } from "../Form/Alert";
import { confirmationModal } from "../Modals/Confirmation";
import { PagedTable } from "../Table/Table";
import { TxMenu } from "./Menu";
import { txModal } from "./TxFields";
import "./TxTable.scss";

export type TxTableProps = {
  asset: EnrichedAsset;
  onDelete: (txid: number) => void;
  onEdit: (txid: number, tx: PostTx) => void;
  onClone: (tx: PostTx) => void;
  disabled?: boolean;
};

const TxTableHeader = ({ disabled, asset }: TxTableProps) => (
  <thead>
    <tr>
      <th>Type</th>
      <th className="d-none d-md-table-cell">Date</th>
      <th>Quantity</th>
      <th>Price</th>
      <th>Cost</th>
      <th>Value</th>
      <th>Return</th>
      <th hidden={asset.domestic}>Return (base)</th>
      <th hidden={asset.domestic}>Fx rate</th>
      <th hidden={asset.domestic}>Fx imact</th>
      {/* <th>Holdings after tx</th>
      <th>Invested after tx</th> */}
      <th className="d-none d-md-table-cell">Comments</th>
      <th hidden={disabled}>&#xfe19;</th>
    </tr>
  </thead>
);

const TxTableRow = (
  tx: EnrichedTx,
  idx: number,
  { disabled, asset, onDelete, onEdit, onClone }: TxTableProps
) => {
  const domestic = asset.domestic;
  const { money, decimal, percent } = useFormatters();
  const handleEdit = (txid: number, tx: PostTx) =>
    pipe(
      () => txModal(tx, asset),
      TE.map((tx) => onEdit(txid, tx))
    );
  const handleClone = (tx: PostTx) =>
    pipe(() => txModal(tx, asset), TE.map(cloneTx), TE.map(onClone));
  const handleDelete = (txid: number) =>
    pipe(
      () => confirmationModal(`Delete transaction?`),
      TE.map(() => onDelete(txid))
    );
  const ccy = asset.meta.currency as Ccy;
  const buy = tx.type == "buy";
  const profitCcy = tx.ccy.returnValue >= 0;
  const profitBase = tx.base.returnValue >= 0;
  return (
    <tr key={tx.id}>
      <td /**type */ className="capitalize">{tx.type}</td>
      <td /**date*/ className="d-none d-md-table-cell">
        {isoTimestamp(tx.date)}
      </td>
      <td /**quantity */>{decimal(tx.quantity)}</td>
      <td /**price/unit */>{money(tx.price, ccy)}</td>
      <td /**cost */>{money(tx.ccy.cost, ccy)}</td>
      <td /**value */>{money(tx.ccy.value, ccy)}</td>
      {/* <td>{decimal(tx.holdings, 5, locale)}</td>
      <td>{money(tx.total_invested, ccy, locale)}</td> */}
      <td
        className={classNames({
          profit: profitCcy,
          loss: !profitCcy,
          unrealized: buy
        })} /**return */
      >
        {money(tx.ccy.returnValue, ccy)}&nbsp; ({percent(tx.ccy.returnPct)})
      </td>
      <td
        hidden={domestic}
        className={classNames({
          profit: profitBase,
          loss: !profitBase,
          unrealized: buy
        })} /**return base */
      >
        {money(tx.base.returnValue)}&nbsp; ({percent(tx.base.returnPct)})
      </td>
      <td /**fx rate */ hidden={domestic}>{money(tx.base.rate, ccy)}</td>
      <td
        /**fx impact */ hidden={domestic}
        className={classNames({
          profit: (tx.base.fxImpact ?? 0) >= 0,
          loss: (tx.base.fxImpact ?? 0) < 0
        })}
      >
        {money(tx.base.fxImpact)}
      </td>
      <td /**comments */ className="d-none d-md-table-cell ellipsis pre">
        {tx.comments.substring(0, 20)}
      </td>
      <td /**menu */ hidden={disabled}>
        <TxMenu
          onClone={handleClone(tx)}
          onEdit={handleEdit(tx.id, tx)}
          onDelete={handleDelete(tx.id)}
        />
      </td>
    </tr>
  );
};

export const TxTable = pipe(
  PagedTable<EnrichedTx, TxTableProps>,
  withProps({
    header: TxTableHeader,
    row: TxTableRow,
    pageSize: 10
  }),
  withCondition(
    (p) => !!p.items.length,
    () => <Dark>No transactions to display</Dark>
  )
);
