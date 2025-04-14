import {
  defaultBuyTx,
  type EnrichedAsset,
  type GetTx,
  type PostTx,
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import * as React from "react";
import { Button, Table, type ButtonProps } from "react-bootstrap";
import { withCondition } from "../../decorators/nodata";
import { withProps } from "../../decorators/props";
import { iso } from "../../util/date";
import { float, money } from "../../util/number";
import { Info } from "../Form/Alert";
import { HorizontalStack } from "../Layout/Stack";
import { confirmationModal } from "../Modals/Confirmation";
import { PortfolioMenu } from "../Portfolio/Menu";
import { txModal } from "./TxModal";

type TxListProps = {
  txs: GetTx[];
  asset: EnrichedAsset;
  onDelete: (txid: number) => void;
  onEdit: (txid: number, tx: PostTx) => void;
  onAdd: (tx: PostTx) => void;
};

const TxList: React.FC<TxListProps> = ({
  txs,
  onEdit,
  onDelete,
  onAdd,
  asset,
}: TxListProps) => {
  const handleAdd = pipe(() => txModal(defaultBuyTx(), asset), TE.map(onAdd));
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
    <>
      <HorizontalStack className="top-toolbar spread-container">
        <AddBtn onClick={handleAdd} />
      </HorizontalStack>
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
    </>
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

const AddBtn = pipe(
  Button,
  withProps({
    size: "sm",
    variant: "outline-primary",
    children: "[+] Add Tx",
  })
) as React.FC<ButtonProps>;
