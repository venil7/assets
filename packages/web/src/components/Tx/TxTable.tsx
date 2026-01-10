import {
  ccyToLocale,
  type Ccy,
  type EnrichedAsset,
  type EnrichedTx,
  type PostTx,
} from "@darkruby/assets-core";
import classNames from "classnames";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { withCondition } from "../../decorators/nodata";
import { withProps } from "../../decorators/props";
import { isoTimestamp } from "../../util/date";
import { decimal, money, percent } from "../../util/number";
import { Dark } from "../Form/Alert";
import { confirmationModal } from "../Modals/Confirmation";
import { PortfolioMenu } from "../Portfolio/Menu";
import { PagedTable } from "../Table/Table";
import { txModal } from "./TxFields";
import "./TxTable.scss";

export type TxTableProps = {
  asset: EnrichedAsset;
  onDelete: (txid: number) => void;
  onEdit: (txid: number, tx: PostTx) => void;
  disabled?: boolean;
};

const TxTableHeader = ({ disabled }: TxTableProps) => (
  <thead>
    <tr>
      <th>Type</th>
      <th className="d-none d-md-table-cell">Date</th>
      <th>Quantity</th>
      <th>Price/Unit</th>
      <th>Cost</th>
      <th>Value</th>
      {/* <th>Holdings after tx</th>
      <th>Invested after tx</th> */}
      <th>Return</th>
      <th className="d-none d-md-table-cell">Comments</th>
      <th hidden={disabled}>&#xfe19;</th>
    </tr>
  </thead>
);

const TxTableRow = (
  tx: EnrichedTx,
  idx: number,
  { disabled, asset, onDelete, onEdit }: TxTableProps
) => {
  const locale = ccyToLocale(asset.meta.currency as Ccy);
  const handleEdit = (txid: number, tx: PostTx) =>
    pipe(
      () => txModal(tx, asset),
      TE.map((tx) => onEdit(txid, tx))
    );
  const handleDelete = (txid: number) =>
    pipe(
      () => confirmationModal(`Delete transaction?`),
      TE.map(() => onDelete(txid))
    );
  const ccy = asset.meta.currency as Ccy;
  const buy = tx.type == "buy";
  const profit = tx.returnCcy >= 0;
  return (
    <tr key={tx.id}>
      <td /**type */ className="capitalize">{tx.type}</td>
      <td /**date*/ className="d-none d-md-table-cell">
        {isoTimestamp(tx.date)}
      </td>
      <td /**quantity */>{decimal(tx.quantity, 5, locale)}</td>
      <td /**price/unit */>{money(tx.price, ccy, locale)}</td>
      <td /**cost */>{money(tx.cost, ccy, locale)}</td>
      <td /**value */>{money(tx.valueCcy, ccy, locale)}</td>
      {/* <td>{decimal(tx.holdings, 5, locale)}</td>
      <td>{money(tx.total_invested, ccy, locale)}</td> */}
      <td
        className={classNames({
          profit,
          loss: !profit,
          unrealized: buy,
        })} /**return */
      >
        {money(tx.returnCcy, ccy, locale)}&nbsp; (
        {percent(tx.returnPct, 3, locale)})
      </td>
      <td /**comments */ className="d-none d-md-table-cell ellipsis pre">
        {tx.comments}
      </td>
      <td /**menu */ hidden={disabled}>
        <PortfolioMenu
          onDelete={handleDelete(tx.id)}
          onEdit={handleEdit(tx.id, tx)}
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
    pageSize: 10,
  }),
  withCondition(
    (p) => !!p.items.length,
    () => <Dark>No transactions to display</Dark>
  )
);
