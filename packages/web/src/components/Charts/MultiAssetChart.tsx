import { type MultiChartData } from "@darkruby/assets-core";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as NeA from "fp-ts/lib/NonEmptyArray";
import * as R from "fp-ts/lib/Record";
import * as React from "react";
import { useMemo } from "react";
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

const fillColors = () => {
  const reds = ["#DB7093", "#CD5C5C", "#F08080", "#FA8072", "#ff2323"];
  const greens = ["#228B22", "#3CB371", "#32CD32", "#00FA9A", "#006400"];
  let [redIdx, greenIdx] = [0, 0];
  const red = () => reds[redIdx++ % reds.length];
  const green = () => greens[greenIdx++ % greens.length];

  return (first: number, last: number) => {
    return last >= first ? green() : red();
  };
};

export type MultiAssetChartProps = ChartProps<MultiChartData>;

const RawMultiAssetChart: React.FC<MultiAssetChartProps> = ({
  data,
  timeFormatter
}: MultiAssetChartProps) => {
  const { percent } = useFormatters();
  const names = R.keys(data);

  const timestamp = useMemo(
    () =>
      pipe(
        data,
        R.toEntries,
        A.map(([, chart]) =>
          pipe(
            chart,
            NeA.map((n) => n.timestamp)
          )
        ),
        A.reduce([0], (_, c) => c)
      ),
    [data]
  );

  const combinedData = useMemo(() => {
    const res = [];
    for (const t in timestamp) {
      let item = { timestamp: timestamp[t] } as Record<string, number>;
      for (const name of names) {
        item[name] = data[name][t].price;
      }
      res.push(item);
    }
    return res;
  }, [timestamp]);

  const color = fillColors();

  return (
    <>
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={combinedData}>
          <XAxis
            minTickGap={50}
            dataKey="timestamp"
            tickFormatter={timeFormatter}
          />
          <YAxis
            hide
            yAxisId="price"
            tickFormatter={percent}
            domain={["dataMin", "dataMax"]}
            orientation="left"
          />
          <Tooltip
            contentStyle={{ backgroundColor: "none", border: "none" }}
            labelFormatter={(t) => `Time: ${timeFormatter(t)}`}
            formatter={tooltipValueFormatter}
          />
          {names.map((name) => {
            const clr = color(
              combinedData[0][name],
              combinedData[combinedData.length - 1][name]
            );
            return (
              <Area
                key={name}
                fill={clr}
                dot={false}
                stroke={clr}
                stackId="all"
                dataKey={name}
                yAxisId="price"
                type="monotone"
                fillOpacity={0.3}
                animationDuration={0}
              />
            );
          })}
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
