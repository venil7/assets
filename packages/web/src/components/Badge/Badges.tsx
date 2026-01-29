import {
  type EnrichedAsset,
  type EnrichedPortfolio,
  type GetAsset,
  type GetPortfolio,
  type Optional,
  type Totals
} from "@darkruby/assets-core";
import type { ChartRange } from "@darkruby/assets-core/src/decoders/yahoo/meta";
import { identity, pipe } from "fp-ts/lib/function";
import { Badge, type BadgeProps } from "react-bootstrap";
import { withFormatters, withProps } from "../../decorators/props";
import { useFormatters } from "../../hooks/prefs";

type ChangeBadgeProps<T> = {
  value: T;
  color?: BadgeProps["bg"];
  numeric: (t: T) => number;
  formatter: (t: T) => string;
};

export function ChangeIndicator<T>({
  value,
  formatter,
  color,
  numeric
}: ChangeBadgeProps<T>) {
  const bg = (() => {
    if (color) return color;
    const n = numeric(value);
    return n < 0 ? "danger" : n > 0 ? "success" : "secondary";
  })();
  return <Badge bg={bg}>{formatter(value)}</Badge>;
}

export const MoneyChangeIndicator = pipe(
  ChangeIndicator<number>,
  withProps({ numeric: identity })
);

export const PctChangeIndicator = pipe(
  ChangeIndicator<number>,
  withProps({ numeric: identity }),
  withFormatters(({ percent }) => ({
    formatter: (n) => percent(n)
  }))
);

export type MoneyAndChangeIndicatorProps = Omit<
  ChangeBadgeProps<Totals> & {
    range?: ChartRange;
  },
  "numeric" | "formatter"
>;
export const MoneyAndChangeIndicator: React.FC<
  MoneyAndChangeIndicatorProps
> = ({ value, range }) => {
  const { money, percent } = useFormatters();
  const numeric = (t: Totals) => t.returnPct;
  const formatter = ({ returnValue, returnPct }: Totals) => {
    const pre = range ? `${range}: ` : "";
    return `${pre}${money(returnValue)} (${percent(returnPct)})`;
  };
  return (
    <ChangeIndicator<Totals>
      value={value}
      numeric={numeric}
      formatter={formatter}
    />
  );
};

export const WeightIndicator = pipe(
  ChangeIndicator<Optional<number>>,
  withProps({
    color: "dark",
    numeric: (n) => n ?? 0
  }),
  withFormatters(({ percent }) => ({
    formatter: (n) => `Weight: ${percent(n)}`
  }))
);

export const PortfolioPeriodChange = pipe(
  ChangeIndicator<EnrichedPortfolio>,
  withProps({
    numeric: (p) => p.value.returnPct
  }),
  withFormatters(({ percent }) => ({
    formatter: (p) => `${p.meta.range}: ${percent(p.value.returnPct)}`
  }))
);

export const AssetCountIndicator = pipe(
  ChangeIndicator<GetPortfolio>,
  withProps({
    color: "dark",
    numeric: (p) => p.num_assets,
    formatter: (p) => `Assets: ${p.num_assets}`
  })
);

export const HoldingsIndicator = pipe(
  ChangeIndicator<GetAsset>,
  withProps({
    color: "dark",
    numeric: (p) => p.holdings
  }),
  withFormatters(({ decimal }) => ({
    formatter: (p) => `Holdings: ${decimal(p.holdings)}`
  }))
);

export const TxCount = pipe(
  ChangeIndicator<GetAsset>,
  withProps({
    color: "dark",
    numeric: (p) => p.num_txs
  }),
  withFormatters(({ decimal }) => ({
    formatter: (p) => `Txs: ${decimal(p.num_txs)}`
  }))
);

export const AssetPeriodChange = pipe(
  ChangeIndicator<EnrichedAsset>,
  withProps({
    numeric: (a) => a.ccy.changes.returnPct
  }),
  withFormatters(({ percent }) => ({
    formatter: (a) => `${a.meta.range}: ${percent(a.ccy.changes.returnPct)}`
  }))
);
