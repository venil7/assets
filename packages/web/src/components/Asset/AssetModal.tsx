import type { PostAsset } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import { useState } from "react";
import { Modal, ModalBody, ModalHeader } from "react-bootstrap";
import {
  createDialog,
  type DialogDrivenComponentProps,
} from "../../util/modal";
import { ConfirmationModalFooter } from "../Modals/Footer";
import { AssetForm } from "./AssetForm";

export type AssetModalProps = DialogDrivenComponentProps<PostAsset>;

export const AssetModal: React.FC<AssetModalProps> = ({
  value,
  open,
  onSubmit,
  onClose,
}) => {
  const [asset, setPortfolio] = useState<PostAsset>(value!);
  const handleOk = () => onSubmit(asset);
  return (
    <Modal show={open}>
      <ModalHeader>Portfolio</ModalHeader>
      <ModalBody>
        <AssetForm asset={asset} onChange={setPortfolio} />
      </ModalBody>
      <ConfirmationModalFooter onOk={handleOk} onCancel={onClose} />
    </Modal>
  );
};

export const assetModal = (value: PostAsset) =>
  pipe({ value }, createDialog<PostAsset, AssetModalProps>(AssetModal));
