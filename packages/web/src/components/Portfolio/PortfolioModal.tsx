import { type PostPortfolio } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import { useState } from "react";
import { Modal, ModalBody, ModalHeader } from "react-bootstrap";
import {
  createDialog,
  type DialogDrivenComponentProps,
} from "../../util/modal";
import { portfolioValidator } from "../../validation/portfolio";
import { ConfirmationModalFooter } from "../Modals/Footer";
import { PortfolioForm } from "./PortfolioForm";

export type PortfolioModalProps = DialogDrivenComponentProps<PostPortfolio>;

export const PortfolioModal: React.FC<PortfolioModalProps> = ({
  value,
  open,
  onSubmit,
  onClose,
}) => {
  const [portfolio, setPortfolio] = useState<PostPortfolio>(value!);
  const handleOk = () => onSubmit(portfolio);
  const { valid } = portfolioValidator(portfolio);

  return (
    <Modal show={open}>
      <ModalHeader>Portfolio</ModalHeader>
      <ModalBody>
        <PortfolioForm portfolio={portfolio} onChange={setPortfolio} />
      </ModalBody>
      <ConfirmationModalFooter
        disabled={!valid}
        onOk={handleOk}
        onCancel={onClose}
      />
    </Modal>
  );
};

export const portfolioModal = (value: PostPortfolio) =>
  pipe(
    { value },
    createDialog<PostPortfolio, PortfolioModalProps>(PortfolioModal)
  );
