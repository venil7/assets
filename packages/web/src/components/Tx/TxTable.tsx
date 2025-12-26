import {
  ccyToLocale,
  type Ccy,
  type EnrichedAsset,
  type GetTx,
  type PostTx,
} from "@darkruby/assets-core";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import * as React from "react";
import { useState } from "react";
import { Table } from "react-bootstrap";
import { withCondition } from "../../decorators/nodata";
import { iso } from "../../util/date";
import { decimal, money } from "../../util/number";
import { Info } from "../Form/Alert";
import { confirmationModal } from "../Modals/Confirmation";
import { itemsByPage, Pager } from "../Pager/Pager";
import { PortfolioMenu } from "../Portfolio/Menu";
import { txModal } from "./TxFields";

const PAGE_SIZE = 5;

export type TxUploadTableProps = {
  txs: PostTx[];
  currency: Ccy;
};

const TxUploadHead = () => (
  <thead>
    <tr>
      <th>Type</th>
      <th>Quantity</th>
      <th>Price/Unit</th>
      <th>Comments</th>
      <th className="d-none d-md-block">Date</th>
    </tr>
  </thead>
);

const RawTxUploadTable: React.FC<TxUploadTableProps> = ({ txs, currency }) => {
  const locale = ccyToLocale(currency);
  const [page, setPage] = useState(0);
  const txsPage = itemsByPage(txs, PAGE_SIZE, page);
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
    <>
      Total {txs.length} transactions, {buys.length} buys (
      {money(buysTotal, currency, locale)}), {sells.length} sells (
      {money(sellsTotal, currency, locale)}), net{" "}
      {money(buysTotal + sellsTotal, currency, locale)}
      <Table responsive={false} striped bordered hover>
        <TxUploadHead />
        <tbody>
          {txsPage.map((tx, idx) => (
            <tr key={page * PAGE_SIZE + idx}>
              <td>{tx.type}</td>
              <td>{decimal(tx.quantity, 5, locale)}</td>
              <td>{money(tx.price, currency, locale)}</td>
              <td>{tx.comments}</td>
              <td className="d-none d-md-table-cell">{iso(tx.date)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Pager
        totalItems={txs.length}
        currentPage={page}
        pageSize={PAGE_SIZE}
        onClick={setPage}
      />
    </>
  );
};

export const TxUploadTable = pipe(
  RawTxUploadTable,
  withCondition<TxUploadTableProps>(
    (p) => !!p.txs.length,
    () => (
      <Table>
        <TxUploadHead />
      </Table>
    )
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
