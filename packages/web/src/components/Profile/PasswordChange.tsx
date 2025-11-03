import {
  defaultPasswordChange,
  passwordChangeValidator,
  type PasswordChange as PasswordChangeData,
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { useState } from "react";
import { Form } from "react-bootstrap";
import { withFetching } from "../../decorators/fetching";
import { usePartialChange } from "../../hooks/formData";
import { PrimaryButton } from "../Form/FormControl";
import { FormErrors } from "../Form/FormErrors";
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
        <Form.Label>Old password</Form.Label>
        <PasswordEdit
          value={data.oldPassword}
          onChange={setField("oldPassword")}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>New Password</Form.Label>
        <PasswordEdit
          value={data.newPassword}
          onChange={setField("newPassword")}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Repeat Password</Form.Label>
        <PasswordEdit value={data.repeat} onChange={setField("repeat")} />
      </Form.Group>
    </Form>
  );
};

type PasswordChangeProps = {
  onSubmit: (pcd: PasswordChangeData) => void;
};

const RawPasswordChange: React.FC<PasswordChangeProps> = ({
  onSubmit,
}: PasswordChangeProps) => {
  const [data, setData] = useState<PasswordChangeData>(defaultPasswordChange());
  const handleOk = () => onSubmit(data);
  const { valid, errors } = passwordChangeValidator(data);
  return (
    <>
      <PasswordChangeForm data={data} onChange={setData} />
      <FormErrors errors={errors} valid={valid} />
      <PrimaryButton disabled={!valid} onClick={handleOk}>
        Submit
      </PrimaryButton>
    </>
  );
};

export const PasswordChange = pipe(RawPasswordChange, withFetching);
