import { byDuration } from "@darkruby/assets-core";
import type { ChartRange } from "@darkruby/assets-core/src/decoders/yahoo/meta";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { useMemo } from "react";
import { Button, ButtonGroup } from "react-bootstrap";

export type RangeButtonsProps = {
  ranges: ChartRange[];
  range: ChartRange;
  className?: string;
  onChange: (r: ChartRange) => void;
};

export const RangeButtons: React.FC<RangeButtonsProps> = ({
  ranges,
  range,
  className,
  onChange
}) => {
  const sortedRanges = useMemo(
    () => pipe(ranges, A.sort(byDuration)),
    [ranges]
  );
  return (
    <ButtonGroup className={className}>
      {sortedRanges.map((rng) => {
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
