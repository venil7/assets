import type { Ccy, Optional } from "@darkruby/assets-core";
import classnames from "classnames";
import * as React from "react";
import { useFormatters } from "../../hooks/prefs";

type MoneyProps = {
  value?: Optional<number>;
  ccy?: Optional<Ccy>;
};

export const Money: React.FC<MoneyProps> = ({ value, ccy }: MoneyProps) => {
  const { money } = useFormatters();
  const neg = (value ?? 0) < 0;
  return (
    <span
      className={classnames({ "money-negative": neg, "money-positive": !neg })}
    >
      {money(value, ccy)}
    </span>
  );
};
