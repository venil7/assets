import type { NewUser } from "@darkruby/assets-core";
import * as React from "react";
import { Form } from "react-bootstrap";
import { usePartialChange } from "../../hooks/formData";
import { CheckBox, FormEdit } from "../Form/FormControl";
import { PasswordEdit } from "../Form/Password";

type NewUserFormProps = {
  data: NewUser;
  onChange: (c: NewUser) => void;
  disabled?: boolean;
};

export const NewUserForm: React.FC<NewUserFormProps> = ({
  data,
  onChange,
  disabled,
}: NewUserFormProps) => {
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
