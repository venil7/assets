import type { Optional } from "@darkruby/assets-core";
import classnames from "classnames";
import * as React from "react";
import { useFormatters } from "../../hooks/prefs";

type PercentProps = {
  value?: Optional<number>;
  prec?: number;
};

export const Percent: React.FC<PercentProps> = ({
  value,
  prec
}: PercentProps) => {
  const { percent } = useFormatters();
  const neg = (value ?? 0) < 0;
  return (
    <span
      className={classnames({
        "percent-negative": neg,
        "percent-positive": !neg
      })}
    >
      {percent(value, prec)}
    </span>
  );
};
