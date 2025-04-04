import * as React from "react";
import { Dropdown, DropdownButton } from "react-bootstrap";

type PortfolioMenuProps = {
  onEdit: () => void;
  onDelete: () => void;
};

export const PortfolioMenu: React.FC<PortfolioMenuProps> = ({
  onDelete,
  onEdit,
}: PortfolioMenuProps) => {
  return (
    <DropdownButton variant="outline-primary" size="sm" title={<></>}>
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
