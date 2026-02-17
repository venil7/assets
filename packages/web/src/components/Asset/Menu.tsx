import * as React from "react";
import { Dropdown, DropdownButton } from "react-bootstrap";

type AssetMenuProps = {
  onEdit: () => void;
  onDelete: () => void;
  onAddTx: () => void;
  onMove: () => void;
};

export const AssetMenu: React.FC<AssetMenuProps> = ({
  onEdit,
  onDelete,
  onAddTx,
  onMove
}: AssetMenuProps) => {
  return (
    <DropdownButton variant="outline-primary" size="sm" title={<></>}>
      <Dropdown.Item onClick={onEdit} eventKey="1">
        Edit
      </Dropdown.Item>
      <Dropdown.Item onClick={onAddTx} eventKey="2">
        Add Transaction
      </Dropdown.Item>
      <Dropdown.Item onClick={onMove} eventKey="3">
        Move to another portoflio
      </Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Item onClick={onDelete} eventKey="4">
        Delete
      </Dropdown.Item>
    </DropdownButton>
  );
};
