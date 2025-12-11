import * as icons from "@fortawesome/free-regular-svg-icons";
import { pipe } from "fp-ts/lib/function";
import { Button, type ButtonProps } from "react-bootstrap";
import { withProps } from "../../decorators/props";
import { LabeledIcon } from "../Icons/Xs";

export const AddIconLabel = pipe(
  LabeledIcon,
  withProps({ icon: icons.faPlusSquare })
);

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
  return <PrimaryBtn {...props} children={<AddIconLabel label={label} />} />;
};
