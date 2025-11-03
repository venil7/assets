import { newUserValidator, type NewUser } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import { useState } from "react";
import { Modal, ModalBody, ModalHeader } from "react-bootstrap";
import {
  createDialog,
  type DialogDrivenComponentProps,
} from "../../util/modal";
import { FormErrors } from "../Form/FormErrors";
import { ConfirmationModalFooter } from "../Modals/Footer";
import { NewUserForm } from "./NewUserForm";

export type NewUserModalProps = DialogDrivenComponentProps<NewUser>;

export const NewUserModal: React.FC<NewUserModalProps> = ({
  value,
  open,
  onSubmit,
  onClose,
}) => {
  const [user, setUser] = useState<NewUser>(value!);
  const handleOk = () => onSubmit(user);
  const { valid, errors } = newUserValidator(user);

  return (
    <Modal show={open}>
      <ModalHeader>New user</ModalHeader>
      <ModalBody>
        <NewUserForm data={user} onChange={setUser} />
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

export const newUserModal = (value: NewUser) =>
  pipe({ value }, createDialog<NewUser, NewUserModalProps>(NewUserModal));
