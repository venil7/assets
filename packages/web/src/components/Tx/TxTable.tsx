import {
  ccyToLocale,
  type Ccy,
  type EnrichedAsset,
  type GetTx,
  type PostTx,
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import * as React from "react";
import { Table } from "react-bootstrap";
import { withCondition } from "../../decorators/nodata";
import { iso } from "../../util/date";
import { decimal, money } from "../../util/number";
import { Info } from "../Form/Alert";
import { confirmationModal } from "../Modals/Confirmation";
import { PortfolioMenu } from "../Portfolio/Menu";
import { txModal } from "./TxFields";

export type TxUploadTableProps = {
  txs: PostTx[];
  currency: Ccy;
};

const RawTxUploadTable: React.FC<TxUploadTableProps> = ({ txs, currency }) => {
  const locale = ccyToLocale(currency as Ccy);

  return (
    <Table responsive={false} striped bordered hover>
      <thead>
        <tr>
          <th>Type</th>
          <th>Quantity</th>
          <th>Price/Unit</th>
          <th>Comments</th>
          <th className="d-none d-md-block">Date</th>
        </tr>
      </thead>
      <tbody>
        {txs.map((tx, idx) => (
          <tr key={idx}>
            <td>{tx.type}</td>
            <td>{decimal(tx.quantity, 5, locale)}</td>
            <td>{money(tx.price, currency, locale)}</td>
            <td>{tx.comments}</td>
            <td className="d-none d-md-table-cell">{iso(tx.date)}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export const TxUploadTable = pipe(
  RawTxUploadTable,
  withCondition<TxUploadTableProps>(
    (p) => !!p.txs.length,
    () => <Info>No transactions to display</Info>
  )
);

export type TxTableProps = {
  txs: GetTx[];
  asset: EnrichedAsset;
  onDelete: (txid: number) => void;
  onEdit: (txid: number, tx: PostTx) => void;
  disabled?: boolean;
};

const RawTxTable: React.FC<TxTableProps> = ({
  txs,
  asset,
  onDelete,
  onEdit,
  disabled,
}) => {
  const locale = ccyToLocale(asset.meta.currency as Ccy);
  const handleEdit = (txid: number, tx: PostTx) =>
    pipe(
      () => txModal(tx, asset),
      TE.map((tx) => onEdit(txid, tx))
    );
  const handleDelete = (txid: number) =>
    pipe(
      () => confirmationModal(`delete transaction?`),
      TE.map(() => onDelete(txid))
    );
  return (
    <Table responsive={false} striped bordered hover>
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
      <tbody>
        {txs.map((tx) => (
          <tr key={tx.id}>
            <td className="d-none d-md-table-cell">{tx.id}</td>
            <td>{tx.type}</td>
            <td>{decimal(tx.quantity, 5, locale)}</td>
            <td>{money(tx.price, asset.meta.currency as Ccy, locale)}</td>
            <td>{tx.comments}</td>
            <td className="d-none d-md-table-cell">{iso(tx.date)}</td>
            <td hidden={disabled}>
              <PortfolioMenu
                onDelete={handleDelete(tx.id)}
                onEdit={handleEdit(tx.id, tx)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export const TxTable = pipe(
  RawTxTable,
  withCondition<TxTableProps>(
    (p) => !!p.txs.length,
    () => <Info>No transactions to display</Info>
  )
);
