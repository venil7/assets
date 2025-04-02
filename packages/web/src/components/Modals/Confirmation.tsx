import { pipe } from "fp-ts/lib/function";
import { Modal, ModalBody, ModalHeader } from "react-bootstrap";
import {
  createDialog,
  type DialogDrivenComponentProps,
} from "../../util/modal";
import { ConfirmationModalFooter } from "./Footer";

export type ConfirmationModalProps = DialogDrivenComponentProps<
  boolean,
  {
    text: string;
  }
>;

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  text,
  open,
  onSubmit,
  onClose,
}) => {
  const handleOk = () => onSubmit(true);
  const handleCancel = () => onClose();
  return (
    <Modal show={open}>
      <ModalHeader>Confirm</ModalHeader>
      <ModalBody>{text}</ModalBody>
      <ConfirmationModalFooter onOk={handleOk} onCancel={handleCancel} />
    </Modal>
  );
};

export const confirmationModal = (text: string) =>
  pipe(
    { value: false, text },
    createDialog<boolean, ConfirmationModalProps>(ConfirmationModal)
  );
