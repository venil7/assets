import type { PostUser } from "@darkruby/assets-core";
import * as React from "react";
import { Form } from "react-bootstrap";
import { usePartialChange } from "../../hooks/formData";
import { CheckBox, FormEdit } from "../Form/FormControl";

type UserFormProps = {
  data: PostUser;
  onChange: (c: PostUser) => void;
  disabled?: boolean;
};

export const UserForm: React.FC<UserFormProps> = ({
  data,
  onChange,
  disabled,
}: UserFormProps) => {
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
      {/* <Form.Group className="mb-3">
        <Form.Label>Password</Form.Label>
        <PasswordEdit
          value={data.password}
          onChange={setField("password")}
          disabled={disabled}
        />
      </Form.Group> */}
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
