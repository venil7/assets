import type { Identity } from "@darkruby/assets-core";
import { usePrefs } from "../../hooks/prefs";
import type { PropsOf } from "../../util/props";
import { AssetChart } from "./AssetChart";
import { MultiAssetChart } from "./MultiAssetChart";

type AssetChartProps = PropsOf<typeof AssetChart>;
type MultiAssetChartProps = PropsOf<typeof MultiAssetChart>;

type AutoChartProps = Identity<
  Omit<AssetChartProps, "data"> | Omit<MultiAssetChartProps, "data">
> & {
  chart: AssetChartProps["data"];
  multiChart: MultiAssetChartProps["data"];
};

export const AutoChart: React.FC<AutoChartProps> = ({
  chart,
  multiChart,
  onChange,
  range,
  ranges,
  hidden
}: AutoChartProps) => {
  const { additional } = usePrefs();
  if (additional.altChart) {
    return (
      <MultiAssetChart
        data={multiChart}
        onChange={onChange}
        range={range}
        ranges={ranges}
        hidden={hidden}
      />
    );
  }
  return (
    <AssetChart
      data={chart}
      onChange={onChange}
      range={range}
      ranges={ranges}
      hidden={hidden}
    />
  );
};
