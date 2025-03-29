import { pipe } from "fp-ts/lib/function";
import { Badge } from "react-bootstrap";
import { withProps } from "../../decorators/props";
import { float, money } from "../../util/number";

type ChangeIndicatorPros = {
  value: number;
  formatter: (n: number) => string;
};
export const ChangeIndicator: React.FC<ChangeIndicatorPros> = ({
  value,
  formatter,
}) => {
  const color = value < 0 ? "danger" : value > 0 ? "success" : "secondary";
  return <Badge bg={color}>{formatter(value)}</Badge>;
};
export const ValueIndicator = pipe(
  ChangeIndicator,
  withProps({ formatter: (n) => money(n) })
);

export const PctIndicator = pipe(
  ChangeIndicator,
  withProps({ formatter: (n) => float(n) })
);
