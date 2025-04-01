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
> = ({ onOk, onCancel }) => {
  return (
    <ModalFooter>
      <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
      <PrimaryButton onClick={onOk}>OK</PrimaryButton>
    </ModalFooter>
  );
};
