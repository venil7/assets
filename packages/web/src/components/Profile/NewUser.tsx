import { newUserValidator, type NewUser } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { Form } from "react-bootstrap";
import { usePartialChange } from "../../hooks/formData";
import { createDialog } from "../../util/modal";
import type { PropsOf } from "../../util/props";
import { createForm } from "../Form/Form";
import { CheckBox, FormEdit } from "../Form/FormControl";
import { PasswordEdit } from "../Form/Password";
import { createModal } from "../Modals/Modal";

type NewUserFieldsProps = {
  data: NewUser;
  onChange: (c: NewUser) => void;
  disabled?: boolean;
};

export const NewUserFields: React.FC<NewUserFieldsProps> = ({
  data,
  onChange,
  disabled,
}: NewUserFieldsProps) => {
  const setField = usePartialChange(data, onChange);
  return (
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Username</Form.Label>
        <FormEdit
          value={data.username}
          onChange={setField("username")}
          disabled={disabled}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Password</Form.Label>
        <PasswordEdit
          value={data.password}
          onChange={setField("password")}
          disabled={disabled}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Admin &nbsp;</Form.Label>
        <CheckBox
          inline
          checked={!!data.admin}
          disabled={disabled}
          onChange={setField("admin")}
        />
        <Form.Label>Locked &nbsp;</Form.Label>
        <CheckBox
          inline
          checked={!!data.locked}
          disabled={disabled}
          onChange={setField("locked")}
        />
      </Form.Group>
    </Form>
  );
};

export const NewUserForm = createForm(NewUserFields, newUserValidator);
export const NewUserModal = createModal(
  NewUserFields,
  newUserValidator,
  "User"
);

export const newUserModal = (value: NewUser) =>
  pipe(
    { value },
    createDialog<NewUser, PropsOf<typeof NewUserModal>>(NewUserModal)
  );
