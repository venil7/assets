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

type UserProfileFieldsProps = FieldsProps<PostUser>;

export const UserProfileFields: React.FC<UserProfileFieldsProps> = ({
  data,
  onChange,
  disabled
}: UserProfileFieldsProps) => {
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

export const UserProfileForm = createForm<PostUser>(
  UserProfileFields,
  postUserValidator
);

export const UserProfileModal = createModal<PostUser>(
  UserProfileFields,
  postUserValidator,
  "User profile"
);

export const userProfileModal = (value: PostUser) =>
  pipe(
    { value },
    createDialog<PostUser, PropsOf<typeof UserProfileModal>>(UserProfileModal)
  );
