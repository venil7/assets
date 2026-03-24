import { type MultiChartData } from "@darkruby/assets-core";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as NeA from "fp-ts/lib/NonEmptyArray";
import * as R from "fp-ts/lib/Record";
import * as React from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type {
  NameType,
  ValueType
} from "recharts/types/component/DefaultTooltipContent";
import { withVisibility } from "../../decorators/nodata";
import { withProps } from "../../decorators/props";
import { useFormatters } from "../../hooks/prefs";
import { RangeChart, type ChartProps } from "./RangeChart";

export type MultiAssetChartProps = ChartProps<MultiChartData>;

const RawMultiAssetChart: React.FC<MultiAssetChartProps> = ({
  data,
  timeFormatter
}: MultiAssetChartProps) => {
  const { money } = useFormatters();
  const tickFormatter = (n: number) => `${n.toFixed(1)}%`;

  const names = R.keys(data);
  const timestamp = pipe(
    data,
    R.toEntries,
    A.map(([, chart]) =>
      pipe(
        chart,
        NeA.map((n) => n.timestamp)
      )
    ),
    A.reduce([0], (_, c) => c)
  );

  const data1 = (function () {
    const res = [];
    for (const t in timestamp) {
      let item = { timestamp: timestamp[t] } as Record<string, number>;
      for (const name of names) {
        item[name] = data[name][t].price;
      }
      res.push(item);
    }
    return res;
  })();

  const entries = R.toEntries(data);

  const tooltipValueFormatter = (value?: ValueType, key?: NameType) => {
    if (key === "timestamp") return null;
    const val = Number(value);
    return (
      <>
        {val >= 0 ? "+" : ""}
        {val.toFixed(2)}%
      </>
    );
  };

  const fill = (i: number) => {
    const colors = [
      "#20B2AA",
      "#F0E68C",
      "#7B68EE",
      "#E6E6FA",
      "#4B0082",
      "#9932CC"
    ];
    return colors[i % colors.length];
  };

  return (
    <>
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={data1}>
          <XAxis
            minTickGap={50}
            dataKey="timestamp"
            tickFormatter={timeFormatter}
          />
          <YAxis
            hide
            yAxisId="price"
            tickFormatter={tickFormatter}
            domain={["dataMin", "dataMax"]}
            orientation="left"
          />
          <Tooltip
            contentStyle={{ backgroundColor: "none", border: "none" }}
            labelFormatter={(t) => `Time: ${timeFormatter(t)}`}
            formatter={tooltipValueFormatter}
          />
          {entries.map(([name, chart], idx) => (
            <Area
              key={name}
              dot={false}
              stackId="all"
              dataKey={name}
              yAxisId="price"
              type="monotone"
              fill={fill(idx)}
              fillOpacity={0.3}
              stroke={fill(idx)}
              animationDuration={0}
            />
          ))}
          <Legend />
          <CartesianGrid stroke="#333" />
        </ComposedChart>
      </ResponsiveContainer>
    </>
  );
};

export const MultiAssetChart = pipe(
  RangeChart<MultiChartData>,
  withProps({ Chart: RawMultiAssetChart }),
  withVisibility()
);
