import { type Credentials } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import { useState } from "react";
import { Modal, ModalBody, ModalHeader } from "react-bootstrap";
import {
  createDialog,
  type DialogDrivenComponentProps,
} from "../../util/modal";
import { credentialsValidator } from "../../validation/credentials";
import { FormErrors } from "../Form/FormErrors";
import { ConfirmationModalFooter } from "../Modals/Footer";
import { CredentailsForm } from "./CredentialsForm";

export type CredentialsModalProps = DialogDrivenComponentProps<Credentials>;

export const CredentialsModal: React.FC<CredentialsModalProps> = ({
  value,
  open,
  onSubmit,
  onClose,
}) => {
  const [creds, setCreds] = useState<Credentials>(value!);
  const handleOk = () => onSubmit(creds);
  const { valid, errors } = credentialsValidator(creds);

  return (
    <Modal show={open}>
      <ModalHeader>User</ModalHeader>
      <ModalBody>
        <CredentailsForm data={creds} onChange={setCreds} />
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

export const credentialsModal = (value: Credentials) =>
  pipe(
    { value },
    createDialog<Credentials, CredentialsModalProps>(CredentialsModal)
  );
