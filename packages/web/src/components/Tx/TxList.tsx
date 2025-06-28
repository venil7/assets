import {
  defaultBuyTx,
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
import { AddBtn } from "../Form/Button";
import { HorizontalStack } from "../Layout/Stack";
import { confirmationModal } from "../Modals/Confirmation";
import { PortfolioMenu } from "../Portfolio/Menu";
import { txModal } from "./TxModal";

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
        <AddBtn onClick={handleAdd} label="Tx" />
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
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>#</th>
          <th>Type</th>
          <th>Quantity</th>
          <th>Price</th>
          <th>Comments</th>
          <th>Date</th>
          <th>^</th>
        </tr>
      </thead>
      <tbody>
        {txs.map((tx) => (
          <tr key={tx.id}>
            <td>{tx.id}</td>
            <td>{tx.type}</td>
            <td>{decimal(tx.quantity)}</td>
            <td>{money(tx.price, asset.meta.currency)}</td>
            <td>{tx.comments}</td>
            <td>{iso(tx.date)}</td>
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
