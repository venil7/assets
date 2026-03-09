import type { Optional } from "@darkruby/assets-core";
import classnames from "classnames";
import * as React from "react";
import { useFormatters } from "../../hooks/prefs";

type PercentProps = {
  value?: Optional<number>;
  prec?: number;
  nocolor?: boolean;
  tag?: keyof React.JSX.IntrinsicElements;
};

export const Percent: React.FC<PercentProps> = ({
  value,
  prec,
  tag = "span",
  nocolor = false
}: PercentProps) => {
  const { percent } = useFormatters();
  const neg = (value ?? 0) < 0;
  const pos = (value ?? 0) > 0;
  const Tag = tag as keyof React.JSX.IntrinsicElements;
  return (
    <Tag
      className={classnames(`percent`, {
        negative: !nocolor && neg,
        positive: !nocolor && pos
      })}
    >
      {percent(value, prec)}
    </Tag>
  );
};
