import { type PasswordChange as PasswordChangeData } from "@darkruby/assets-core";
import * as React from "react";
import { Form } from "react-bootstrap";
import { usePartialChange } from "../../hooks/formData";
import { PasswordEdit } from "../Form/Password";

type PasswordChangeFormProps = {
  data: PasswordChangeData;
  onChange: (pcd: PasswordChangeData) => void;
};

export const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({
  data,
  onChange,
}: PasswordChangeFormProps) => {
  const setField = usePartialChange(data, onChange);
  return (
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Password</Form.Label>
        <PasswordEdit value={data.password} onChange={setField("password")} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Repeat</Form.Label>
        <PasswordEdit value={data.repeat} onChange={setField("repeat")} />
      </Form.Group>
    </Form>
  );
};
