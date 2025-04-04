import * as React from "react";
import { ModalFooter } from "react-bootstrap";
import { PrimaryButton, SecondaryButton } from "../Form/FormControl";

type ConfirmationModalFooterProps = {
  onOk: () => void;
  onCancel: () => void;
  disabled?: boolean;
};

export const ConfirmationModalFooter: React.FC<
  ConfirmationModalFooterProps
> = ({ onOk, onCancel, disabled }) => {
  return (
    <ModalFooter>
      <PrimaryButton disabled={disabled} onClick={onOk}>
        OK
      </PrimaryButton>
      <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
    </ModalFooter>
  );
};
