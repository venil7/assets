import type { Ccy, Optional } from "@darkruby/assets-core";
import classnames from "classnames";
import * as React from "react";
import { useFormatters } from "../../hooks/prefs";

type MoneyProps = {
  value?: Optional<number>;
  ccy?: Optional<Ccy>;
  locale?: string;
  nocolor?: boolean;
  tag?: keyof React.JSX.IntrinsicElements;
};

export const Money: React.FC<MoneyProps> = ({
  value,
  ccy,
  locale,
  nocolor = false,
  tag = "span"
}: MoneyProps) => {
  const { money } = useFormatters();
  const neg = (value ?? 0) < 0;
  const pos = (value ?? 0) > 0;
  const Tag = tag as keyof React.JSX.IntrinsicElements;

  return (
    <Tag
      className={classnames(`money`, {
        negative: !nocolor && neg,
        positive: !nocolor && pos
      })}
    >
      {money(value, ccy, locale)}
    </Tag>
  );
};
