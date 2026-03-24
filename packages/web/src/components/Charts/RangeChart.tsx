import { tfForRange, type UnixDate } from "@darkruby/assets-core";
import type { ChartRange } from "@darkruby/assets-core/src/decoders/yahoo/meta";
import * as React from "react";
import { useMemo } from "react";
import "./Chart.scss";
import { RangeButtons } from "./RangeButtons";

export type ChartProps<CD> = {
  data: CD;
  timeFormatter: (timestamp: UnixDate) => string;
};

export type RangeChartProps<CD> = {
  data: CD;
  range: ChartRange;
  ranges: ChartRange[];
  onChange: (r: ChartRange) => void;
  Chart: React.FC<ChartProps<CD>>;
};

export function RangeChart<CD>({
  data,
  range,
  ranges,
  onChange,
  Chart
}: RangeChartProps<CD>) {
  const timeFormatter = useMemo(() => tfForRange(range), [range]);
  const props = { data, timeFormatter: timeFormatter };

  return (
    <div className="range-chart">
      <Chart {...props} />
      <div className="spread-container table-responsive">
        <div className="stick-left">&nbsp;</div>
        <div className="stick-right">
          <RangeButtons range={range} ranges={ranges} onChange={onChange} />
        </div>
      </div>
    </div>
  );
}
