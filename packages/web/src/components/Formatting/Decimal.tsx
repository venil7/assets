import type { Optional } from "@darkruby/assets-core";
import classnames from "classnames";
import * as React from "react";
import { useFormatters } from "../../hooks/prefs";

type DecimalProps = {
  value?: Optional<number>;
  prec?: number;
};

export const Decimal: React.FC<DecimalProps> = ({
  value,
  prec
}: DecimalProps) => {
  const { decimal } = useFormatters();
  const neg = (value ?? 0) < 0;
  return (
    <span
      className={classnames({
        "decimal-negative": neg,
        "decimal-positive": !neg
      })}
    >
      {decimal(value, prec)}
    </span>
  );
};
