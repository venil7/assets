import * as React from "react";
import { Dropdown, DropdownButton } from "react-bootstrap";

type AssetMenuProps = {
  onEdit: () => void;
  onDelete: () => void;
  onAddTx: () => void;
};

export const AssetMenu: React.FC<AssetMenuProps> = ({
  onDelete,
  onEdit,
  onAddTx,
}: AssetMenuProps) => {
  return (
    <DropdownButton variant="outline-primary" size="sm" title={<></>}>
      <Dropdown.Item onClick={onEdit} eventKey="1">
        Edit
      </Dropdown.Item>
      <Dropdown.Item onClick={onAddTx} eventKey="2">
        Add Transaction
      </Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Item onClick={onDelete} eventKey="4">
        Delete
      </Dropdown.Item>
    </DropdownButton>
  );
};
