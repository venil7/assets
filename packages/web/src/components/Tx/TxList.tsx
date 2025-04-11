import type { GetTx, PostTx } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import * as React from "react";
import { Table } from "react-bootstrap";
import { withCondition } from "../../decorators/nodata";
import { iso } from "../../util/date";
import { float, money } from "../../util/number";
import { Info } from "../Form/Alert";
import { confirmationModal } from "../Modals/Confirmation";
import { PortfolioMenu } from "../Portfolio/Menu";
import { txModal } from "./TxModal";

type TxListProps = {
  txs: GetTx[];
  onDelete: (txid: number) => void;
  onEdit: (txid: number, tx: PostTx) => void;
};

const TxList: React.FC<TxListProps> = ({
  txs,
  onEdit,
  onDelete,
}: TxListProps) => {
  const handleEdit = (txid: number, tx: PostTx) =>
    pipe(
      () => txModal(tx),
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
            <td>{float(tx.quantity)}</td>
            <td>{money(tx.price)}</td>
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

const TxListEnh = pipe(
  TxList,
  withCondition<TxListProps>(
    (p) => !!p.txs.length,
    () => <Info>No data to display</Info>
  )
);

export { TxListEnh as TxList };
