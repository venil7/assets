import { postUserValidator, type PostUser } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import { useState } from "react";
import { Modal, ModalBody, ModalHeader } from "react-bootstrap";
import {
  createDialog,
  type DialogDrivenComponentProps,
} from "../../util/modal";
import { FormErrors } from "../Form/FormErrors";
import { ConfirmationModalFooter } from "../Modals/Footer";
import { UserForm } from "./UserForm";

export type UserModalProps = DialogDrivenComponentProps<PostUser>;

export const UserModal: React.FC<UserModalProps> = ({
  value,
  open,
  onSubmit,
  onClose,
}) => {
  const [user, setUser] = useState<PostUser>(value!);
  const handleOk = () => onSubmit(user);
  const { valid, errors } = postUserValidator(user);

  return (
    <Modal show={open}>
      <ModalHeader>User</ModalHeader>
      <ModalBody>
        <UserForm data={user} onChange={setUser} />
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

export const userModal = (value: PostUser) =>
  pipe({ value }, createDialog<PostUser, UserModalProps>(UserModal));
