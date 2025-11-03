import type { EnrichedAsset, Identity, PostTx } from "@darkruby/assets-core";
import { txValidator } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import { useState } from "react";
import { Modal, ModalBody, ModalHeader } from "react-bootstrap";
import {
  createDialog,
  type DialogDrivenComponentProps,
} from "../../util/modal";
import { FormErrors } from "../Form/FormErrors";
import { ConfirmationModalFooter } from "../Modals/Footer";
import { TxForm } from "./TxForm";

export type TxModalProps = Identity<
  DialogDrivenComponentProps<PostTx> & {
    asset: EnrichedAsset;
  }
>;

export const TxModal: React.FC<TxModalProps> = ({
  value,
  open,
  onSubmit,
  onClose,
  asset,
}) => {
  const [tx, setTx] = useState<PostTx>(value!);
  const handleOk = () => onSubmit(tx);

  const { valid, errors } = txValidator(tx);

  return (
    <Modal show={open}>
      <ModalHeader>Transaction</ModalHeader>
      <ModalBody>
        <TxForm tx={tx} onChange={setTx} asset={asset} />
        <FormErrors errors={errors} valid={valid} />
      </ModalBody>
      <ConfirmationModalFooter
        disabled={!valid}
        onOk={handleOk}
        onCancel={onClose}
      />
    </Modal>
  );
};

export const txModal = (value: PostTx, asset: EnrichedAsset) =>
  pipe({ value, asset }, createDialog<PostTx, TxModalProps>(TxModal));
