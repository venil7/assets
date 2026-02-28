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
import { txDetailsModal } from "./TxDetail";
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
      <th hidden={disabled}>&#xfe19;</th>
    </tr>
  </thead>
);

const TxTableRow = (
  tx: EnrichedTx,
  _idx: number,
  { disabled, asset, onDelete, onEdit, onClone }: TxTableProps
) => {
  const domestic = asset.domestic;
  const { money, decimal, percent } = useFormatters();
  const handleView = (tx: EnrichedTx) => () => txDetailsModal(tx, { asset });
  const handleEdit = (txid: number, tx: PostTx) =>
    pipe(
      () => txModal(tx, { asset }),
      TE.map((tx) => onEdit(txid, tx))
    );
  const handleClone = (tx: PostTx) =>
    pipe(() => txModal(tx, { asset }), TE.map(cloneTx), TE.map(onClone));
  const handleDelete = (txid: number) =>
    pipe(
      () => confirmationModal(`Delete transaction?`),
      TE.map(() => onDelete(txid))
    );
  const ccy = asset.meta.currency as Ccy;
  const buy = tx.type == "buy";
  const profitCcy = tx.pnl_pct >= 0;
  return (
    <tr key={tx.id} onClick={handleView(tx)}>
      <td /**type */ className="capitalize">{tx.type}</td>
      <td /**date*/ className="d-none d-md-table-cell">
        {isoTimestamp(tx.date)}
      </td>
      <td /**quantity */>{decimal(tx.quantity)}</td>
      <td /**price/unit */>{money(tx.price, ccy)}</td>
      <td /**cost */>{money(tx.cost, ccy)}</td>
      <td /**value */>{money(tx.value, ccy)}</td>
      <td
        className={classNames({
          profit: profitCcy,
          loss: !profitCcy,
          unrealized: buy
        })} /**return */
      >
        {money(tx.pnl, ccy)}&nbsp; ({percent(tx.pnl_pct)})
      </td>
      <td /**menu */ hidden={disabled} onClick={(evt) => evt.stopPropagation()}>
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
