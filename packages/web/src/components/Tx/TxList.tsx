import {
  defaultBuyTx,
  type Ccy,
  type Identity,
  type PostTx,
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import * as React from "react";
import { HorizontalStack } from "../Layout/Stack";
import { TxButton } from "./Button";
import { txModal } from "./TxFields";
import { txsUploadModal } from "./TxsFields";
import { TxTable, type TxTableProps } from "./TxTable";

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

  const handleUpload = () => {
    const currency = props.asset.meta.currency as Ccy;
    return pipe(() => txsUploadModal(currency), TE.map(console.log))();
  };

  return (
    <>
      <HorizontalStack className="top-toolbar spread-container">
        <TxButton
          onAdd={handleAdd}
          onCsvUpload={handleUpload}
          onDeleteTxs={console.log}
        />
      </HorizontalStack>
      <TxTable {...props} />
    </>
  );
};
