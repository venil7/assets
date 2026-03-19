import {
  defined,
  isBuy,
  isSell,
  type ChartData,
  type ChartDataPoint
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { useMemo } from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type DotItemDotProps
} from "recharts";
import type {
  NameType,
  ValueType
} from "recharts/types/component/DefaultTooltipContent";
import { withVisibility } from "../../decorators/nodata";
import { withProps } from "../../decorators/props";
import { useFormatters } from "../../hooks/prefs";
import { RangeChart, type ChartProps } from "./RangeChart";

export type AssetChartProps = ChartProps<ChartData>;

const RawAssetChart: React.FC<AssetChartProps> = ({
  data,
  timeFormatter
}: AssetChartProps) => {
  const { money } = useFormatters();
  const tickFormatter = (n: number) => money(n);

  const tooltipValueFormatter = (value?: ValueType, key?: NameType) => {
    switch (key) {
      case "price":
      case "volume":
        return <>{money(Number(value))}</>;
      default:
        return <>{value}</>;
    }
  };

  const [stroke, gradient] = useMemo(() => {
    if (data.length > 1) {
      const first = data[0];
      const last = data[data.length - 1];
      if (last.price > first.price) {
        return ["mediumseagreen", "rising"];
      }
      return ["firebrick", "falling"];
    }
    return ["mediumseagreen", "rising"];
  }, [data]);

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
            tickFormatter={tickFormatter}
            domain={["dataMin", "dataMax"]}
            orientation="left"
          />
          <YAxis
            hide
            yAxisId="volume"
            dataKey="volume"
            tickFormatter={tickFormatter}
            domain={["dataMin", "dataMax"]}
            orientation="right"
          />
          <Tooltip
            contentStyle={{ backgroundColor: "none", border: "none" }}
            labelFormatter={(t) => `Time: ${timeFormatter(t)}`}
            formatter={tooltipValueFormatter}
          />
          <Bar yAxisId="volume" dataKey="volume" fill="#413ea055" />
          <defs>
            <linearGradient id="rising" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00FA9A" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#00FA9A" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="falling" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FA8072" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#FA8072" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <Area
            data={data}
            dot={EventDot}
            yAxisId="price"
            type="monotone"
            dataKey="price"
            stroke={stroke}
            fillOpacity={1}
            fill={`url(#${gradient})`}
            animationDuration={0}
          />
          <CartesianGrid stroke="#333" />
        </ComposedChart>
      </ResponsiveContainer>
    </>
  );
};

export const AssetChart = pipe(
  RangeChart<ChartData>,
  withProps({ Chart: RawAssetChart }),
  withVisibility()
);

const EventDot = ({ cx, cy, payload }: DotItemDotProps) => {
  const tx: ChartDataPoint["tx"] = payload.tx;
  if (!tx || !defined(cx) || !defined(cy)) return null;
  const size = 2;

  switch (true) {
    case isBuy(tx):
      return (
        <g>
          <circle cx={cx} cy={cy} r={size} fill="green" stroke="#00FA9A" />
        </g>
      );
    case isSell(tx):
      return (
        <g>
          <circle cx={cx} cy={cy} r={size} fill="red" stroke="#FF4500" />
        </g>
      );
    default:
      return null;
  }
};
