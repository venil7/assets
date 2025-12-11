import {
  faPlusSquare,
  faStopCircle,
} from "@fortawesome/free-regular-svg-icons";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { Dropdown, SplitButton } from "react-bootstrap";
import { withProps } from "../../decorators/props";
import { AddIconLabel } from "../Form/Button";
import { LabeledIcon } from "../Icons/Xs";

export const UploadTxIconLabel = pipe(
  LabeledIcon,
  withProps({ icon: faPlusSquare, label: "Upload transactons" })
);

export const DeleteTxIconLabel = pipe(
  LabeledIcon,
  withProps({ icon: faStopCircle, label: "Delete transactons" })
);

type TxButtonProps = {
  onAdd: () => void;
  onCsvUpload: () => void;
  onDeleteTxs: () => void;
  disabled?: boolean;
};

export const TxButton: React.FC<TxButtonProps> = ({
  onAdd,
  onCsvUpload,
  onDeleteTxs,
  disabled,
}: TxButtonProps) => {
  return (
    <SplitButton
      variant="outline-primary"
      size="sm"
      onClick={onAdd}
      title={<AddIconLabel label="Tx" />}
      disabled={disabled}
    >
      <Dropdown.Item eventKey="1" onClick={onCsvUpload}>
        <UploadTxIconLabel />
      </Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Item eventKey="2" onClick={onDeleteTxs}>
        <DeleteTxIconLabel />
      </Dropdown.Item>
    </SplitButton>
  );
};
