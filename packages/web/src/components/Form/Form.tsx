import type { Validator } from "@darkruby/assets-core/src/validation/util";
import { useState } from "react";
import { PrimaryButton } from "./FormControl";
import { FormErrors } from "./FormErrors";

export type FieldsProps<T> = {
  data: T;
  onChange: (t: T) => void;
  disabled?: boolean;
};

export type FormProps<T> = Omit<FieldsProps<T>, "onChange"> & {
  onSubmit: (t: T) => void;
};

export type Form<T> = React.FC<FormProps<T>>;

export function createForm<T>(
  Fields: React.FC<FieldsProps<T>>,
  validator: Validator
): Form<T> {
  return ({ data, disabled, onSubmit }: FormProps<T>) => {
    const [inner, setInner] = useState(data);
    const { valid, errors } = validator(inner);
    const handleSubmit = () => onSubmit(inner);
    return (
      <>
        <FormErrors errors={errors} valid={valid} />
        <Fields data={inner} onChange={setInner} disabled={disabled} />
        <PrimaryButton disabled={!valid || disabled} onClick={handleSubmit}>
          Submit
        </PrimaryButton>
      </>
    );
  };
}
