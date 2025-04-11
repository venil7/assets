import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as NeA from "fp-ts/lib/NonEmptyArray";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import type {
  ChartData,
  EnrichedAsset,
  GetAsset,
  PeriodChanges,
  Totals,
} from "../domain";
import { yahooApi } from "../http";
import { changeInValue, changeInValuePct, sum } from "../utils/finance";
import type { Action, Optional } from "../utils/utils";
import { baseCcyConversionRate } from "./yahoo";

export const enrichedAssets = (assets: GetAsset[]): Action<EnrichedAsset[]> =>
  pipe(
    assets,
    TE.traverseArray(enrichAsset),
    TE.map((assets) => calcWeights(assets as EnrichedAsset[]))
  ) as Action<EnrichedAsset[]>;

export const enrichOptionalAsset = (
  a: Optional<GetAsset>
): Action<Optional<EnrichedAsset>> => (a ? enrichAsset(a) : TE.of(null));

export const enrichAsset = (asset: GetAsset): Action<EnrichedAsset> => {
  return pipe(
    TE.Do,
    TE.apS("asset", TE.of(asset)),
    TE.bind("enrich", ({ asset }) => yahooApi.chart(asset.ticker)),
    TE.bind("conversionRate", ({ enrich }) =>
      baseCcyConversionRate(enrich.meta.currency)
    ),
    TE.map(
      ({
        asset,
        enrich: { chart: origChart, price, meta },
        conversionRate,
      }) => {
        const chart: ChartData = pipe(
          origChart,
          NeA.map((dp) => ({
            ...dp,
            // if no holdings, keep price per unit
            price: dp.price * (asset.holdings || 1),
          }))
        );

        const base = (n: number) => n / conversionRate;

        const valueCcy: PeriodChanges = {
          beginning: price.beginning * asset.holdings,
          current: price.current * asset.holdings,
          change: price.change,
          changePct: price.changePct,
          date: price.date,
        };

        const valueBase: PeriodChanges = {
          beginning: base(valueCcy.beginning),
          current: base(valueCcy.current),
          change: changeInValue(base(valueCcy.beginning))(
            base(valueCcy.current)
          ),
          changePct: changeInValuePct(base(valueCcy.beginning))(
            base(valueCcy.current)
          ),
          date: price.date,
        };

        const totalsCcy = ((): Totals => {
          const profitLoss = pipe(
            O.fromNullable(asset.avg_price),
            O.map(() => changeInValue(asset.invested)(valueCcy.current)),
            O.getOrElse(() => 0)
          );
          const profitLossPct = pipe(
            O.fromNullable(asset.avg_price),
            O.map(() => changeInValuePct(asset.invested)(valueCcy.current)),
            O.getOrElse(() => 0)
          );
          return { profitLoss, profitLossPct };
        })();

        const totalsBase = ((): Totals => {
          const profitLoss = pipe(
            O.fromNullable(asset.avg_price),
            O.map(() => changeInValue(base(asset.invested))(valueBase.current)),
            O.getOrElse(() => 0)
          );
          const profitLossPct = pipe(
            O.fromNullable(asset.avg_price),
            O.map(() =>
              changeInValuePct(base(asset.invested))(valueBase.current)
            ),
            O.getOrElse(() => 0)
          );
          return { profitLoss, profitLossPct };
        })();

        return {
          ...asset,
          meta,
          chart,
          value: {
            ccy: valueCcy,
            base: valueBase,
            weight: null,
          },
          totals: {
            ccy: totalsCcy,
            base: totalsBase,
          },
        };
      }
    )
  );
};

export const calcWeights = (assets: EnrichedAsset[]): EnrichedAsset[] => {
  const total = pipe(
    assets,
    sum(({ value }) => value.base.beginning)
  );
  return pipe(
    assets,
    A.map((a) => {
      if (total > 0) {
        a.value.weight = a.value.base.current / total;
      }
      return a;
    })
  );
};
