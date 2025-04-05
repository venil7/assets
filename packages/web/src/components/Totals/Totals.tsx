import type {
  PeriodChanges,
  Totals as TotalsData,
} from "@darkruby/assets-core";
import * as React from "react";
import { money } from "../../util/number";
import { PctIndicator, ValueIndicator } from "../Badge/Badges";
import "./Totals.scss";

type TotalsProps = {
  value: PeriodChanges;
  totals: TotalsData;
};

export const Totals: React.FC<TotalsProps> = ({
  value,
  totals,
}: TotalsProps) => {
  return (
    <div className="totals">
      <h3 className="value">{money(value.current)}</h3>
      <div className="change">
        <h6 className="value">
          <ValueIndicator value={totals.profitLoss} />
        </h6>
        <h6 className="pct">
          <PctIndicator value={totals.profitLossPct} />
        </h6>
      </div>
    </div>
  );
};
