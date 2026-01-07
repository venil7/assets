import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as NeA from "fp-ts/lib/NonEmptyArray";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import type { Ccy } from "../decoders";
import { DEFAULT_CHART_RANGE, type ChartRange } from "../decoders/yahoo/meta";
import type {
  ChartData,
  EnrichedAsset,
  GetAsset,
  PeriodChanges,
  Totals,
} from "../domain";
import type { YahooApi } from "../http";
import { changeInValue, changeInValuePct, sum } from "../utils/finance";
import type { Action, Optional } from "../utils/utils";
import { baseCcyConversionRate } from "./yahoo";

export const getAssetEnricher =
  (yahooApi: YahooApi) =>
  (
    asset: GetAsset,
    // txs: GetTx[],
    baseCcy: Ccy,
    range: ChartRange = DEFAULT_CHART_RANGE
  ): Action<EnrichedAsset> => {
    const getBaseCcyConversionRate = baseCcyConversionRate(yahooApi);
    return pipe(
      TE.Do,
      TE.apS("asset", TE.of(asset)),
      TE.bind("enrich", ({ asset }) => yahooApi.chart(asset.ticker, range)),
      TE.bind("baseRate", ({ enrich }) =>
        getBaseCcyConversionRate(enrich.meta.currency, baseCcy)
      ),
      TE.map(
        ({ asset, enrich: { chart: origChart, price, meta }, baseRate }) => {
          const toBase = (n: number) => n / baseRate;
          const investedBase = toBase(asset.invested);

          const chartCcy: ChartData = pipe(
            origChart,
            NeA.map((dp) => ({
              ...dp,
              // if no holdings, keep price per unit
              price: dp.price * (asset.holdings || 1),
            }))
          );
          const chartBase: ChartData = pipe(
            chartCcy,
            NeA.map((dp) => ({
              ...dp,
              price: toBase(dp.price),
            }))
          );

          const valueCcy: PeriodChanges = {
            // if no holdings, we consider price for 1 unit
            beginning: price.beginning * (asset.holdings || 1),
            current: price.current * (asset.holdings || 1),
            change: price.change,
            changePct: price.changePct,
            start: price.start,
            end: price.end,
          };

          const valueBase: PeriodChanges = {
            beginning: toBase(valueCcy.beginning),
            current: toBase(valueCcy.current),
            change: changeInValue(toBase(valueCcy.beginning))(
              toBase(valueCcy.current)
            ),
            changePct: changeInValuePct(toBase(valueCcy.beginning))(
              toBase(valueCcy.current)
            ),
            start: price.start,
            end: price.end,
          };

          const totalsCcy = ((): Totals => {
            const change = pipe(
              O.fromNullable(asset.avg_price),
              O.map(() => changeInValue(asset.invested)(valueCcy.current)),
              O.getOrElse(() => 0)
            );
            const changePct = pipe(
              O.fromNullable(asset.avg_price),
              O.map(() => changeInValuePct(asset.invested)(valueCcy.current)),
              O.getOrElse(() => 0)
            );
            return { change, changePct };
          })();

          const totalsBase = ((): Totals => {
            const change = pipe(
              O.fromNullable(asset.avg_price),
              O.map(() =>
                changeInValue(toBase(asset.invested))(valueBase.current)
              ),
              O.getOrElse(() => 0)
            );
            const changePct = pipe(
              O.fromNullable(asset.avg_price),
              O.map(() =>
                changeInValuePct(toBase(asset.invested))(valueBase.current)
              ),
              O.getOrElse(() => 0)
            );
            return { change, changePct };
          })();

          return {
            ...asset,
            meta,
            investedBase,
            chart: {
              ccy: chartCcy,
              base: chartBase,
            },
            value: {
              ccy: valueCcy,
              base: valueBase,
              baseRate,
              //weight cannot be calculated for single asset
              weight: 0,
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

export const getAssetsEnricher =
  (yahooApi: YahooApi) =>
  (
    assets: GetAsset[],
    baseCcy: Ccy,
    range?: ChartRange
  ): Action<EnrichedAsset[]> => {
    const enrichAsset = getAssetEnricher(yahooApi);
    return pipe(
      assets,
      TE.traverseArray((asset) => enrichAsset(asset, baseCcy, range)),
      TE.map((assets) => calcAssetWeights(assets as EnrichedAsset[]))
    ) as Action<EnrichedAsset[]>;
  };

export const getOptionalAssetsEnricher =
  (yahooApi: YahooApi) =>
  (
    a: Optional<GetAsset>,
    baseCcy: Ccy,
    range?: ChartRange
  ): Action<Optional<EnrichedAsset>> => {
    if (a) {
      const enrichAsset = getAssetEnricher(yahooApi);
      return enrichAsset(a, baseCcy, range);
    }
    return TE.of(null);
  };

export const calcAssetWeights = (assets: EnrichedAsset[]): EnrichedAsset[] => {
  const total = pipe(
    assets,
    sum(({ value }) => value.base.current)
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
