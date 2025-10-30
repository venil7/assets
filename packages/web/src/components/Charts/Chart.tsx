import type { ChartData, ChartDataItem } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { withVisibility } from "../../decorators/nodata";
import { useFormatters } from "../../hooks/prefs";

export type ChartProps = {
  data: ChartData;
  timeFormatter: (n: ChartDataItem["timestamp"]) => string;
};

const RawChart: React.FC<ChartProps> = ({
  data,
  timeFormatter,
}: ChartProps) => {
  const { money } = useFormatters();

  const tooltipValueFormatter = (v: number, n: keyof ChartDataItem) => {
    switch (n) {
      case "price":
        return money(v);
      case "volume":
        return money(v);
      default:
        String(v);
    }
  };

  const [stroke, fill] = (function () {
    if (data.length > 1) {
      const first = data[0];
      const last = data[data.length - 1];
      if (last.price > first.price) {
        return ["MediumSeaGreen", "MediumAquamarine"];
      }
      return ["Firebrick", "LightSalmon"];
    }

    return ["plum", "lavender"];
  })();

  return (
    <>
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={data}>
          <XAxis
            minTickGap={50}
            dataKey="timestamp"
            tickFormatter={timeFormatter}
          />
          <YAxis
            hide
            yAxisId="price"
            dataKey="price"
            tickFormatter={money}
            domain={["dataMin", "dataMax"]}
            orientation="left"
          />
          <YAxis
            hide
            yAxisId="volume"
            dataKey="volume"
            tickFormatter={money}
            domain={["dataMin", "dataMax"]}
            orientation="right"
          />
          <Tooltip
            contentStyle={{ backgroundColor: "none", border: "none" }}
            labelFormatter={(t) => `Time: ${timeFormatter(t)}`}
            formatter={tooltipValueFormatter}
          />
          <Bar yAxisId="volume" dataKey="volume" fill="#413ea055" />
          <Line
            yAxisId="price"
            dot={false}
            type="linear"
            dataKey="price"
            stroke={stroke}
            animationDuration={0}
          />
          <CartesianGrid stroke="#333" />
        </ComposedChart>
      </ResponsiveContainer>
    </>
  );
};

export const Chart = pipe(RawChart, withVisibility());
