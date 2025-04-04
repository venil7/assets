import * as React from "react";
import { Dropdown, DropdownButton } from "react-bootstrap";

type TxMenuProps = {
  onEdit: () => void;
  onDelete: () => void;
};

export const TxMenu: React.FC<TxMenuProps> = ({
  onDelete,
  onEdit,
}: TxMenuProps) => {
  return (
    <DropdownButton variant="outline-primary" size="sm" title={<>...</>}>
      <Dropdown.Item onClick={onEdit} eventKey="1">
        Edit
      </Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Item onClick={onDelete} eventKey="4">
        Delete
      </Dropdown.Item>
    </DropdownButton>
  );
};
