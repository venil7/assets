import {
  defaultBuyTx,
  type Ccy,
  type Identity,
  type PostTx,
  type PostTxsUpload,
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import * as React from "react";
import type { PropsOf } from "../../util/props";
import { HorizontalStack } from "../Layout/Stack";
import { confirmationModal } from "../Modals/Confirmation";
import { TxButton } from "./Button";
import { txModal } from "./TxFields";
import { txsUploadModal } from "./TxsFields";
import { TxTable } from "./TxTable";

type TxListProps = Identity<
  PropsOf<typeof TxTable> & {
    onAdd: (tx: PostTx) => void;
    onDeleteAll: () => void;
    onUploadTxs: (txs: PostTxsUpload) => void;
  }
>;

export const TxList: React.FC<TxListProps> = ({
  onAdd,
  onDeleteAll,
  onUploadTxs,
  ...props
}: TxListProps) => {
  const handleAdd = pipe(
    () => txModal(defaultBuyTx(), props.asset),
    TE.map(onAdd)
  );

  const handleUpload = () => {
    const currency = props.asset.meta.currency as Ccy;
    return pipe(() => txsUploadModal(currency), TE.map(onUploadTxs))();
  };
  const handleDeleteAll = () => {
    return pipe(
      () =>
        confirmationModal(`Delete all transaction for ${props.asset.ticker}`),
      TE.map(onDeleteAll)
    )();
  };

  return (
    <>
      <HorizontalStack className="top-toolbar spread-container">
        <TxButton
          onAdd={handleAdd}
          onCsvUpload={handleUpload}
          onDeleteTxs={handleDeleteAll}
        />
      </HorizontalStack>
      <TxTable {...props} />
    </>
  );
};
