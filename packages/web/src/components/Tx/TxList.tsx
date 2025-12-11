import {
  ccyToLocale,
  defaultBuyTx,
  type Ccy,
  type EnrichedAsset,
  type GetTx,
  type Identity,
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
import { HorizontalStack } from "../Layout/Stack";
import { confirmationModal } from "../Modals/Confirmation";
import { PortfolioMenu } from "../Portfolio/Menu";
import { TxButton } from "./Button";
import { txModal } from "./TxFields";

type TxListProps = Identity<
  TxTableProps & {
    onAdd: (tx: PostTx) => void;
  }
>;

export const TxList: React.FC<TxListProps> = ({
  onAdd,
  ...props
}: TxListProps) => {
  const handleAdd = pipe(
    () => txModal(defaultBuyTx(), props.asset),
    TE.map(onAdd)
  );

  return (
    <>
      <HorizontalStack className="top-toolbar spread-container">
        <TxButton
          onAdd={handleAdd}
          onCsvUpload={console.log}
          onDeleteTxs={console.log}
        />
      </HorizontalStack>
      <TxTable {...props} />
    </>
  );
};

type TxTableProps = {
  txs: GetTx[];
  asset: EnrichedAsset;
  onDelete: (txid: number) => void;
  onEdit: (txid: number, tx: PostTx) => void;
};

const RawTxTable: React.FC<TxTableProps> = ({
  txs,
  asset,
  onDelete,
  onEdit,
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
          <th>Price Per Unit</th>
          <th>Comments</th>
          <th className="d-none d-md-block">Date</th>
          <th>^</th>
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
            <td>
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

const TxTable = pipe(
  RawTxTable,
  withCondition<TxTableProps>(
    (p) => !!p.txs.length,
    () => <Info>No transactions to display</Info>
  )
);
