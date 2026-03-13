import type { Optional } from "@darkruby/assets-core";
import classnames from "classnames";
import * as React from "react";
import { useFormatters } from "../../hooks/prefs";

type DecimalProps = {
  value?: Optional<number>;
  prec?: number;
  tag?: keyof React.JSX.IntrinsicElements;
  nocolor?: boolean;
};

export const Decimal: React.FC<DecimalProps> = ({
  value,
  prec,
  tag = "span",
  nocolor = true
}: DecimalProps) => {
  const Tag = tag as keyof React.JSX.IntrinsicElements;

  const { decimal } = useFormatters();
  const neg = (value ?? 0) < 0;
  const pos = (value ?? 0) > 0;
  return (
    <Tag
      className={classnames(`decimal`, {
        negative: !nocolor && neg,
        positive: !nocolor && pos
      })}
    >
      {decimal(value, prec)}
    </Tag>
  );
};
