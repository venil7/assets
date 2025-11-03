import {
  passwordChangeValidator,
  type PasswordChange as PasswordChangeData,
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import { useState } from "react";
import { Modal, ModalBody, ModalHeader } from "react-bootstrap";
import {
  createDialog,
  type DialogDrivenComponentProps,
} from "../../util/modal";
import { FormErrors } from "../Form/FormErrors";
import { ConfirmationModalFooter } from "../Modals/Footer";
import { PasswordChangeForm } from "./PasswordChange";

export type PasswordChangeModalProps =
  DialogDrivenComponentProps<PasswordChangeData>;

export const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({
  value,
  open,
  onSubmit,
  onClose,
}) => {
  const [pwdChange, setPwdChange] = useState<PasswordChangeData>(value!);
  const handleOk = () => onSubmit(pwdChange);
  const { valid, errors } = passwordChangeValidator(pwdChange);

  return (
    <Modal show={open}>
      <ModalHeader>Change Password</ModalHeader>
      <ModalBody>
        <PasswordChangeForm data={pwdChange} onChange={setPwdChange} />
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

export const passwordChangeModal = (value: PasswordChangeData) =>
  pipe(
    { value },
    createDialog<PasswordChangeData, PasswordChangeModalProps>(
      PasswordChangeModal
    )
  );
