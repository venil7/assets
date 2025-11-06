import type { Validator } from "@darkruby/assets-core/src/validation/util";
import { useState } from "react";
import { Modal, ModalBody, ModalHeader } from "react-bootstrap";
import type { DialogDrivenComponentProps } from "../../util/modal";
import type { FieldsProps } from "../Form/Form";
import { FormErrors } from "../Form/FormErrors";
import { ConfirmationModalFooter } from "./Footer";

export function createModal<T>(
  Fields: React.FC<FieldsProps<T>>,
  validator: Validator,
  title = "Edit"
): React.FC<DialogDrivenComponentProps<T>> {
  return ({
    onClose,
    onSubmit,
    open,
    value,
  }: DialogDrivenComponentProps<T>) => {
    const [user, setUser] = useState<T>(value!);
    const handleOk = () => onSubmit(user);
    const { valid, errors } = validator(user);

    return (
      <Modal show={open}>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>
          <Fields data={user} onChange={setUser} />
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
}
