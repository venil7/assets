import { postUserValidator, type PostUser } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { Form } from "react-bootstrap";
import { usePartialChange } from "../../hooks/formData";
import { createDialog } from "../../util/modal";
import type { PropsOf } from "../../util/props";
import { createForm, type FieldsProps } from "../Form/Form";
import { CheckBox, FormEdit } from "../Form/FormControl";
import { createModal } from "../Modals/Modal";

type UserFieldsProps = FieldsProps<PostUser>;

export const UserFields: React.FC<UserFieldsProps> = ({
  data,
  onChange,
  disabled,
}: UserFieldsProps) => {
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

export const UserForm = createForm<PostUser>(UserFields, postUserValidator);

export const UserModal = createModal<PostUser>(
  UserFields,
  postUserValidator,
  "User"
);

export const userModal = (value: PostUser) =>
  pipe({ value }, createDialog<PostUser, PropsOf<typeof UserModal>>(UserModal));
