import {
  ccyToLocale,
  type Ccy,
  type EnrichedAsset,
  type GetTx,
  type PostTx,
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { withCondition } from "../../decorators/nodata";
import { withProps } from "../../decorators/props";
import { isoTimestamp } from "../../util/date";
import { decimal, money } from "../../util/number";
import { Dark } from "../Form/Alert";
import { confirmationModal } from "../Modals/Confirmation";
import { PortfolioMenu } from "../Portfolio/Menu";
import { PagedTable } from "../Table/Table";
import { txModal } from "./TxFields";

export type TxTableProps = {
  asset: EnrichedAsset;
  onDelete: (txid: number) => void;
  onEdit: (txid: number, tx: PostTx) => void;
  disabled?: boolean;
};

const TxTableHeader = ({ disabled }: TxTableProps) => (
  <thead>
    <tr>
      <th className="d-none d-md-block">#</th>
      <th>Type</th>
      <th>Quantity</th>
      <th>Price/Unit</th>
      <th>Comments</th>
      <th className="d-none d-md-block">Date</th>
      <th hidden={disabled}>^</th>
    </tr>
  </thead>
);

const TxTableRow = (
  tx: GetTx,
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
  return (
    <tr key={tx.id}>
      <td className="d-none d-md-table-cell">{tx.id}</td>
      <td>{tx.type}</td>
      <td>{decimal(tx.quantity, 5, locale)}</td>
      <td>{money(tx.price, asset.meta.currency as Ccy, locale)}</td>
      <td>{tx.comments}</td>
      <td className="d-none d-md-table-cell">{isoTimestamp(tx.date)}</td>
      <td hidden={disabled}>
        <PortfolioMenu
          onDelete={handleDelete(tx.id)}
          onEdit={handleEdit(tx.id, tx)}
        />
      </td>
    </tr>
  );
};

export const TxTable = pipe(
  PagedTable<GetTx, TxTableProps>,
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
