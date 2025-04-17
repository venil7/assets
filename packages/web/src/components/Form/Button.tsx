import { pipe } from "fp-ts/lib/function";
import { Button, type ButtonProps } from "react-bootstrap";
import { withProps } from "../../decorators/props";

const RawAddBtn = pipe(
  Button,
  withProps({
    size: "sm",
    variant: "outline-primary",
    // children: "[+]",
  })
) as React.FC<ButtonProps>;

export const AddBtn: React.FC<{ label: string } & ButtonProps> = ({
  label,
  ...props
}) => {
  return <RawAddBtn {...props} children={`[+] ${label}`} />;
};
