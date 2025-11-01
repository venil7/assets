import { pipe } from "fp-ts/lib/function";
import {
  Button,
  Form,
  type ButtonProps,
  type FormControlProps,
} from "react-bootstrap";
import { withOverridenProps, withProps } from "../../decorators/props";

export const FormControl = pipe(
  Form.Control as React.FC<FormControlProps>,
  withOverridenProps<
    FormControlProps,
    "onChange",
    {
      onChange: (
        f: (v: string) => void
      ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
    }
  >({
    onChange:
      (f: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) =>
        f(e.target.value),
  })
);

export const FormEdit = pipe(FormControl, withProps({ type: "text" }));
export const TextArea = pipe(
  FormControl,
  withProps({ type: "text", as: "textarea" })
) as typeof FormEdit;
export const FormPassword = pipe(FormControl, withProps({ type: "password" }));

const NonSubmittingButton = pipe(
  Button as React.FC<React.PropsWithChildren & ButtonProps>,
  withOverridenProps<
    ButtonProps,
    "onClick",
    {
      onClick: (f: () => void) => (e: React.FormEvent) => void;
    }
  >({
    onClick: (f: () => void) => (e: React.FormEvent) => {
      e.preventDefault();
      f();
    },
  })
);

export const PrimaryButton = pipe(
  NonSubmittingButton,
  withProps({ variant: "primary", type: "button" })
) as React.FC<React.PropsWithChildren & ButtonProps>;

export const SecondaryButton = pipe(
  NonSubmittingButton,
  withProps({ variant: "secondary", type: "button" })
) as React.FC<React.PropsWithChildren & ButtonProps>;

export const DangerButton = pipe(
  NonSubmittingButton,
  withProps({ variant: "danger", type: "button" })
) as React.FC<React.PropsWithChildren & ButtonProps>;
