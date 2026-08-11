import * as React from "react";
import { Dropdown, DropdownButton } from "react-bootstrap";

type UserMenuProps = {
  onEditProfile: () => void;
  onChangePassword: () => void;
  onDelete: () => void;
};

export const UserMenu: React.FC<UserMenuProps> = ({
  onDelete,
  onEditProfile,
  onChangePassword
}: UserMenuProps) => {
  return (
    <DropdownButton variant="outline-primary" size="sm" title={<></>}>
      <Dropdown.Header>Actions</Dropdown.Header>
      <Dropdown.Item onClick={onEditProfile} eventKey="1">
        Edit profile
      </Dropdown.Item>
      <Dropdown.Item onClick={onChangePassword} eventKey="2">
        Update password
      </Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Item onClick={onDelete} eventKey="3">
        Delete
      </Dropdown.Item>
    </DropdownButton>
  );
};
