import type { Identity } from "@darkruby/assets-core";
import type { Validator } from "@darkruby/assets-core/src/validation/util";
import { useState } from "react";
import { PrimaryButton } from "./FormControl";
import { FormErrors } from "./FormErrors";

export type FieldsProps<T> = {
  data: T;
  onChange: (t: T) => void;
  disabled?: boolean;
};

export type FormProps<FieldProps> =
  FieldProps extends FieldsProps<infer T>
    ? Identity<
        Omit<FieldProps, "onChange"> & {
          onSubmit: (t: T) => void;
        }
      >
    : never;

export type Form<T> = React.FC<FormProps<FieldsProps<T>>>;

export function createForm<T, FP extends FieldsProps<T> = FieldsProps<T>>(
  Fields: React.FC<FP>,
  validator: Validator
): Form<T> {
  return (({ data, disabled, onSubmit, ...rest }: FormProps<FP>) => {
    const [inner, setInner] = useState(data);
    const { valid, errors } = validator(inner);
    const handleSubmit = () => onSubmit(inner);
    const fpProps = {
      ...rest,
      data: inner,
      onChange: setInner,
      disabled: disabled,
    } as unknown as FP;
    return (
      <>
        <FormErrors errors={errors} valid={valid} />
        <Fields {...fpProps} />
        <PrimaryButton disabled={!valid || disabled} onClick={handleSubmit}>
          Submit
        </PrimaryButton>
      </>
    );
  }) as Form<T>;
}
