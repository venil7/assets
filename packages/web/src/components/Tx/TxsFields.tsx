import {
  byDate,
  defaultTxsUpload,
  txsUploadValidator,
  type AppError,
  type Ccy,
  type Identity,
  type Nullable,
  type PostTx,
  type PostTxsUpload,
} from "@darkruby/assets-core";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { useState } from "react";
import { Error } from "../../decorators/errors";
import { usePartialChange } from "../../hooks/formData";
import { createDialog } from "../../util/modal";
import type { PropsOf } from "../../util/props";
import type { FieldsProps } from "../Form/Form";
import { CheckBox } from "../Form/FormControl";
import { createModal } from "../Modals/Modal";
import { TxCsvUpload } from "./TxCsvUpload";
import { TxUploadTable } from "./TxTable";

export type TxsUploadFieldsProps = Identity<
  FieldsProps<PostTxsUpload> & { currency: Ccy }
>;

export const TxsUploadFields: React.FC<TxsUploadFieldsProps> = ({
  data,
  onChange,
  disabled,
  currency,
}) => {
  const [error, setError] = useState<Nullable<AppError>>(null);
  const setField = usePartialChange(data, onChange);
  const setTxs = setField("txs");
  const setReplace = setField("replace");
  const handleParse = (txs: PostTx[], error: Nullable<AppError>) => {
    if (error) return setTxs([]) || setError(error);
    setTxs(pipe(txs, A.sort(byDate))) || setError(null);
  };

  return (
    <div>
      <Error error={error} />
      <TxCsvUpload onParse={handleParse} disabled={disabled} />
      <TxUploadTable txs={data.txs} currency={currency} />
      <CheckBox onChange={setReplace} label="Replace" />
    </div>
  );
};

export const TxsUploadModal = createModal<PostTxsUpload, TxsUploadFieldsProps>(
  TxsUploadFields,
  txsUploadValidator,
  "Upload transactions"
);

export const txsUploadModal = (currency: Ccy) => {
  return pipe(
    { value: defaultTxsUpload(), currency },
    createDialog<PostTxsUpload, PropsOf<typeof TxsUploadModal>>(TxsUploadModal)
  );
};
