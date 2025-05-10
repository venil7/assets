import type { Credentials } from "@darkruby/assets-core";
import * as React from "react";
import { Form } from "react-bootstrap";
import { usePartialChange } from "../../hooks/formData";
import { FormEdit } from "../Form/FormControl";
import { PasswordEdit } from "../Form/Password";

type CredentialsFormProps = {
  data: Credentials;
  onChange: (c: Credentials) => void;
};

export const CredentailsForm: React.FC<CredentialsFormProps> = ({
  data,
  onChange,
}: CredentialsFormProps) => {
  const setField = usePartialChange(data, onChange);
  return (
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Username</Form.Label>
        <FormEdit value={data.username} onChange={setField("username")} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Password</Form.Label>
        <PasswordEdit value={data.password} onChange={setField("password")} />
      </Form.Group>
    </Form>
  );
};
