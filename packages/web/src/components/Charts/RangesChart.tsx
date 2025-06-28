import type { ChartRange } from "@darkruby/assets-core/src/decoders/yahoo/meta";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { Button, ButtonGroup } from "react-bootstrap";
import { withVisibility } from "../../decorators/nodata";
import { Chart, type ChartProps } from "./Chart";
import "./Chart.scss";

type RangeChartProps = ChartProps & {
  range: ChartRange;
  ranges: ChartRange[];
  onChange: (r: ChartRange) => void;
};

const RawRangeChart: React.FC<RangeChartProps> = ({
  data,
  range,
  ranges,
  onChange,
  ...rest
}) => {
  return (
    <div className="range-chart">
      <Chart data={data} {...rest} />
      <div className="spread-container">
        <div className="stick-left">&nbsp;</div>
        <div className="stick-right">
          <RangeButtons range={range} ranges={ranges} onChange={onChange} />
        </div>
      </div>
    </div>
  );
};

type RangeButtonsProps = {
  ranges: ChartRange[];
  range: ChartRange;
  className?: string;
  onChange: (r: ChartRange) => void;
};
const RangeButtons: React.FC<RangeButtonsProps> = ({
  ranges,
  range,
  className,
  onChange,
}) => {
  return (
    <ButtonGroup className={className}>
      {ranges.map((rng) => {
        const variant = rng == range ? "primary" : "secondary";
        return (
          <Button key={rng} variant={variant} onClick={() => onChange(rng)}>
            {rng}
          </Button>
        );
      })}
    </ButtonGroup>
  );
};

export const RangeChart = pipe(RawRangeChart, withVisibility());
