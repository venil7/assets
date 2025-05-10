import { pipe } from "fp-ts/lib/function";
import { Button, type ButtonProps } from "react-bootstrap";
import { withProps } from "../../decorators/props";

const PrimaryBtn = pipe(
  Button,
  withProps({
    size: "sm",
    variant: "outline-primary",
  })
) as React.FC<ButtonProps>;

export const AddBtn: React.FC<{ label: string } & ButtonProps> = ({
  label,
  ...props
}) => {
  return <PrimaryBtn {...props} children={`[+] ${label}`} />;
};
