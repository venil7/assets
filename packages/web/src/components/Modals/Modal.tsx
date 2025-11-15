import type { Validator } from "@darkruby/assets-core/src/validation/util";
import { useState } from "react";
import { Modal, ModalBody, ModalHeader } from "react-bootstrap";
import type { DialogDrivenComponentProps } from "../../util/modal";
import type { FieldsProps } from "../Form/Form";
import { FormErrors } from "../Form/FormErrors";
import { ConfirmationModalFooter } from "./Footer";

export function createModal<T, FP extends FieldsProps<T> = FieldsProps<T>>(
  Fields: React.FC<FP>,
  validator: Validator,
  title = "Edit"
): React.FC<DialogDrivenComponentProps<T>> {
  return ({
    onClose,
    onSubmit,
    open,
    value,
    ...rest
  }: DialogDrivenComponentProps<T>) => {
    const [data, setData] = useState<T>(value!);
    const handleOk = () => onSubmit(data);
    const { valid, errors } = validator(data);
    const fieldProps = { ...rest, data: data, onChange: setData } as FP;

    return (
      <Modal show={open}>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>
          <Fields {...fieldProps} />
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
