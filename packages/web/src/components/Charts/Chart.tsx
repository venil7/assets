import type { ArrayItem, ChartData } from "@darkruby/assets-core";
import { format } from "date-fns";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { withVisibility } from "../../decorators/nodata";
import { money } from "../../util/number";

type ChartProps = {
  data: ChartData;
  timeFormatter?: (n: ArrayItem<ChartData>["timestamp"]) => string;
  priceFormatter?: (n: ArrayItem<ChartData>["price"]) => string;
};

const RawChart: React.FC<ChartProps> = ({
  data,
  timeFormatter = (t) => format(t * 1000, "HH:mm"),
  priceFormatter = (n) => money(n),
}: ChartProps) => {
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
        <AreaChart data={data}>
          <Area
            fill={fill}
            dot={false}
            type="monotone"
            dataKey="price"
            stroke={stroke}
            animationDuration={0}
          />
          <XAxis dataKey="timestamp" tickFormatter={timeFormatter} />
          <YAxis
            width={100}
            dataKey="price"
            tickFormatter={priceFormatter}
            domain={["dataMin", "dataMax"]}
          />
        </AreaChart>
      </ResponsiveContainer>
    </>
  );
};

export const Chart = pipe(RawChart, withVisibility());
