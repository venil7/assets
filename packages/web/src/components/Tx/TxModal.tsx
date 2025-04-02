import type { PostTx } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import { useState } from "react";
import { Modal, ModalBody, ModalHeader } from "react-bootstrap";
import {
  createDialog,
  type DialogDrivenComponentProps,
} from "../../util/modal";
import { ConfirmationModalFooter } from "../Modals/Footer";
import { TxForm } from "./TxForm";

export type TxModalProps = DialogDrivenComponentProps<PostTx>;

export const TxModal: React.FC<TxModalProps> = ({
  value,
  open,
  onSubmit,
  onClose,
}) => {
  const [portfolio, setTx] = useState<PostTx>(value!);
  const handleOk = () => onSubmit(portfolio);
  return (
    <Modal show={open}>
      <ModalHeader>Transaction</ModalHeader>
      <ModalBody>
        <TxForm tx={portfolio} onChange={setTx} />
      </ModalBody>
      <ConfirmationModalFooter onOk={handleOk} onCancel={onClose} />
    </Modal>
  );
};

export const txModal = (value: PostTx) =>
  pipe({ value }, createDialog<PostTx, TxModalProps>(TxModal));
