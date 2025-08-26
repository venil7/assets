import {
  type EnrichedAsset,
  type EnrichedPortfolio,
  type GetAsset,
  type GetPortfolio,
} from "@darkruby/assets-core";
import { identity, pipe } from "fp-ts/lib/function";
import { Badge, type BadgeProps } from "react-bootstrap";
import { withProps } from "../../decorators/props";
import { decimal, money, percent } from "../../util/number";

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
  numeric,
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
  withProps({ formatter: money, numeric: identity })
);

export const PctChangeIndicator = pipe(
  ChangeIndicator<number>,
  withProps({ formatter: (n) => percent(n), numeric: identity })
);

export const WeightIndicator = pipe(
  ChangeIndicator<number>,
  withProps({
    color: "dark",
    numeric: identity,
    formatter: (n) => `Weight: ${percent(n)}`,
  })
);

export const PortfolioPeriodChange = pipe(
  ChangeIndicator<EnrichedPortfolio>,
  withProps({
    numeric: (p) => p.value.changePct,
    formatter: (p) => `${p.meta.range}: ${percent(p.value.changePct)}`,
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

export const HoldingsIndicator = pipe(
  ChangeIndicator<GetAsset>,
  withProps({
    color: "dark",
    numeric: (p) => p.holdings,
    formatter: (p) => `Holdings: ${decimal(p.holdings)}`,
  })
);

export const TxCount = pipe(
  ChangeIndicator<GetAsset>,
  withProps({
    color: "dark",
    numeric: (p) => p.num_txs,
    formatter: (p) => `Txs: ${decimal(p.num_txs)}`,
  })
);

export const AssetPeriodChange = pipe(
  ChangeIndicator<EnrichedAsset>,
  withProps({
    numeric: (a) => a.value.ccy.changePct,
    formatter: (a) => `${a.meta.range}: ${percent(a.value.ccy.changePct)}`,
  })
);
