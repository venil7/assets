import type { Totals as TotalsData } from "@darkruby/assets-core";
import * as React from "react";
import { money } from "../../util/number";
import { MoneyChangeIndicator, PctChangeIndicator } from "../Badge/Badges";
import "./Totals.scss";

type TotalsProps = {
  value: number;
  totals: TotalsData;
};

export const Totals: React.FC<TotalsProps> = ({
  value,
  totals,
}: TotalsProps) => {
  return (
    <div className="totals">
      <h4 className="value">{money(value)}</h4>
      <div className="change">
        <h6 className="value">
          <MoneyChangeIndicator value={totals.change} />
        </h6>
        <h6 className="pct">
          <PctChangeIndicator value={totals.changePct} />
        </h6>
      </div>
    </div>
  );
};
