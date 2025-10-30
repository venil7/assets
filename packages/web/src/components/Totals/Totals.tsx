import type {
  PeriodChanges,
  Totals as TotalsData,
} from "@darkruby/assets-core";
import type { ChartRange } from "@darkruby/assets-core/src/decoders/yahoo/meta";
import * as React from "react";
import { useFormatters } from "../../hooks/prefs";
import { MoneyAndChangeIndicator } from "../Badge/Badges";
import "./Totals.scss";

type TotalsProps = {
  totals: TotalsData;
  change: PeriodChanges;
  range: ChartRange;
};

export const Totals: React.FC<TotalsProps> = ({
  totals,
  change,
  range,
}: TotalsProps) => {
  const { money } = useFormatters();

  return (
    <div className="totals">
      <h4 className="value">{money(change.current)}</h4>
      <div className="change">
        <h6 className="value">
          <MoneyAndChangeIndicator value={totals} />
        </h6>
        <h6 className="pct">
          <MoneyAndChangeIndicator value={change} range={range} />
        </h6>
      </div>
    </div>
  );
};
