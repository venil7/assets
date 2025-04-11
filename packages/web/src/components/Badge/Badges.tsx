import type {
  EnrichedAsset,
  EnrichedPortfolio,
  GetPortfolio,
} from "@darkruby/assets-core";
import { identity, pipe } from "fp-ts/lib/function";
import { Badge, type BadgeProps } from "react-bootstrap";
import { withProps } from "../../decorators/props";
import { float, money } from "../../util/number";

type ChnageBadgeProps<T> = {
  value: T;
  color?: BadgeProps["bg"];
  numeric: (t: T) => number;
  formatter: (t: T) => string;
};

export function ChangeIndicator<T>({
  value,
  formatter,
  color,
  numeric,
}: ChnageBadgeProps<T>) {
  const bg = (() => {
    if (color) return color;
    const n = numeric(value);
    return n < 0 ? "danger" : n > 0 ? "success" : "secondary";
  })();
  return <Badge bg={bg}>{formatter(value)}</Badge>;
}

export const MoneyChangeIndicator = pipe(
  ChangeIndicator<number>,
  withProps({ formatter: money, numeric: identity })
);

export const PctChangeIndicator = pipe(
  ChangeIndicator<number>,
  withProps({ formatter: (n) => `${float(n)}%`, numeric: identity })
);

export const WeightIndicator = pipe(
  ChangeIndicator<number>,
  withProps({
    color: "dark",
    numeric: identity,
    formatter: (n) => `Weight: ${float(n * 100)}%`,
  })
);

export const AssetWeightIndicator = pipe(
  ChangeIndicator<EnrichedAsset>,
  withProps({
    color: "dark",
    numeric: (p) => p.value.weight ?? 0,
    formatter: (p) => `Weight: ${float((p.value.weight ?? 0) * 100)}%`,
  })
);

export const PortfolioWeightIndicator = pipe(
  ChangeIndicator<EnrichedPortfolio>,
  withProps({
    color: "dark",
    numeric: (p) => p.contribution,
    formatter: (p) => `Weight: ${float(p.contribution * 100)}%`,
  })
);

export const PortfolioPeriodChange = pipe(
  ChangeIndicator<EnrichedPortfolio>,
  withProps({
    numeric: (p) => p.value.changePct,
    formatter: (p) => `1d: ${float(p.value.changePct)}%`,
  })
);

export const AssetCountIndicator = pipe(
  ChangeIndicator<GetPortfolio>,
  withProps({
    color: "dark",
    numeric: (p) => p.num_assets,
    formatter: (p) => `Assets: ${p.num_assets}`,
  })
);

export const AssetPeriodChange = pipe(
  ChangeIndicator<EnrichedAsset>,
  withProps({
    numeric: (a) => a.value.ccy.changePct,
    formatter: (a) => `${a.meta.range}: ${float(a.value.ccy.changePct)}%`,
  })
);
