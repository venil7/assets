import {
  defaultPasswordChange,
  type PasswordChange as PasswordChangeData
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { Form } from "react-bootstrap";
import { withFetching } from "../../decorators/fetching";
import { withProps } from "../../decorators/props";
import { usePartialChange } from "../../hooks/formData";
import { createDialog } from "../../util/modal";
import type { PropsOf } from "../../util/props";
import { passwordChangeValidator } from "../../validation";
import { createForm, type FieldsProps } from "../Form/Form";
import { PasswordEdit } from "../Form/Password";
import { createModal } from "../Modals/Modal";

type PasswordChangeFieldsProps = FieldsProps<PasswordChangeData> & {
  ignoreOldPassword?: boolean;
};

export const PasswordChangeFields: React.FC<PasswordChangeFieldsProps> = ({
  data,
  onChange,
  disabled,
  ignoreOldPassword = false
}: PasswordChangeFieldsProps) => {
  const setField = usePartialChange(data, onChange);
  return (
    <Form>
      <Form.Group className="mb-3" hidden={ignoreOldPassword}>
        <Form.Label>Old password</Form.Label>
        <PasswordEdit
          disabled={disabled}
          value={data.oldPassword}
          onChange={setField("oldPassword")}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>New Password</Form.Label>
        <PasswordEdit
          disabled={disabled}
          value={data.newPassword}
          onChange={setField("newPassword")}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Repeat Password</Form.Label>
        <PasswordEdit
          disabled={disabled}
          value={data.repeat}
          onChange={setField("repeat")}
        />
      </Form.Group>
    </Form>
  );
};

export const PasswordChange = pipe(
  createForm<PasswordChangeData>(PasswordChangeFields, passwordChangeValidator),
  withProps({ data: defaultPasswordChange() }),
  withFetching
);

export const PasswordChangeModal = createModal<PasswordChangeData>(
  PasswordChangeFields,
  passwordChangeValidator,
  "Change password"
);

export const passwordChangeModal = (value: PasswordChangeData) =>
  pipe(
    { value, ignoreOldPassword: true },
    createDialog<PasswordChangeData, PropsOf<typeof PasswordChangeModal>>(
      PasswordChangeModal
    )
  );
