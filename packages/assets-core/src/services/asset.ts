import { fromUnixTime, getUnixTime } from "date-fns";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as NeA from "fp-ts/lib/NonEmptyArray";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import type { Ccy } from "../decoders";
import { DEFAULT_CHART_RANGE, type ChartRange } from "../decoders/yahoo/meta";
import {
  defaultBuyTx,
  EARLIEST_DATE,
  getToBase,
  type ChartData,
  type ChartDataItem,
  type EnrichedAsset,
  type GetAsset,
  type GetTx,
  type PeriodChanges,
  type Totals
} from "../domain";
import type { YahooApi } from "../http";
import { changeInPct, changeInValue, sum } from "../utils/finance";
import type { Action, Optional } from "../utils/utils";

export const getAssetEnricher =
  (yahooApi: YahooApi) =>
  (
    asset: GetAsset,
    getAssetTxs: (after: Date) => Action<GetTx[]>,
    baseCcy: Ccy,
    range: ChartRange = DEFAULT_CHART_RANGE
  ): Action<EnrichedAsset> => {
    // const getBaseCcyConversionRate = baseCcyConversionRate(yahooApi);
    return pipe(
      TE.Do,
      TE.apS("asset", TE.of(asset)),
      TE.bind("chart", ({ asset }) => yahooApi.chart(asset.ticker, range)),
      TE.bind("txs", ({ chart }) => {
        const earliestDp = NeA.head(chart.chart);
        return getAssetTxs(fromUnixTime(earliestDp.timestamp));
      }),
      TE.bind("baseRate", ({ chart }) =>
        yahooApi.baseCcyConversionRate(chart.meta.currency, baseCcy)
      ),
      TE.map(
        ({
          txs,
          asset,
          chart: { chart: origChart, price, meta },
          baseRate
        }) => {
          const toBase = getToBase(baseRate);
          const investedBase = toBase(asset.invested);

          const chartCcy: ChartData = enrichWithTxs(origChart, txs);
          const chartBase: ChartData = pipe(
            chartCcy,
            NeA.map((dp) => ({
              ...dp,
              price: toBase(dp.price)
            }))
          );

          const valueCcy: PeriodChanges = {
            // if no holdings, we consider price for 1 unit
            beginning: price.beginning * (asset.holdings || 1),
            current: price.current * (asset.holdings || 1),
            change: price.change,
            changePct: price.changePct,
            start: price.start,
            end: price.end
          };

          const valueBase: PeriodChanges = {
            beginning: toBase(valueCcy.beginning),
            current: toBase(valueCcy.current),
            change: changeInValue({
              before: toBase(valueCcy.beginning),
              after: toBase(valueCcy.current)
            }),
            changePct: changeInPct({
              before: toBase(valueCcy.beginning),
              after: toBase(valueCcy.current)
            }),
            start: price.start,
            end: price.end
          };

          const totalsCcy = ((): Totals => {
            const change = pipe(
              O.fromNullable(asset.avg_price),
              O.map(() =>
                changeInValue({
                  before: asset.invested,
                  after: valueCcy.current
                })
              ),
              O.getOrElse(() => 0)
            );
            const changePct = pipe(
              O.fromNullable(asset.avg_price),
              O.map(() =>
                changeInPct({
                  before: asset.invested,
                  after: valueCcy.current
                })
              ),
              O.getOrElse(() => 0)
            );
            return { change, changePct };
          })();

          const totalsBase = ((): Totals => {
            const change = pipe(
              O.fromNullable(asset.avg_price),
              O.map(() =>
                changeInValue({
                  before: toBase(asset.invested),
                  after: valueBase.current
                })
              ),
              O.getOrElse(() => 0)
            );
            const changePct = pipe(
              O.fromNullable(asset.avg_price),
              O.map(() =>
                changeInPct({
                  before: toBase(asset.invested),
                  after: valueBase.current
                })
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
              base: chartBase
            },
            value: {
              ccy: valueCcy,
              base: valueBase,
              baseRate,
              //weight cannot be calculated for single asset
              weight: 0
            },
            totals: {
              ccy: totalsCcy,
              base: totalsBase
            }
          };
        }
      )
    );
  };

export const getAssetsEnricher =
  (yahooApi: YahooApi) =>
  (
    assets: GetAsset[],
    getAssetTxs: (asset: GetAsset, after: Date) => Action<GetTx[]>,
    baseCcy: Ccy,
    range?: ChartRange
  ): Action<EnrichedAsset[]> => {
    const assetTxs = (asset: GetAsset) => (after: Date) =>
      getAssetTxs(asset, after);
    const enrichAsset = getAssetEnricher(yahooApi);
    return pipe(
      assets,
      TE.traverseArray((asset) =>
        enrichAsset(asset, assetTxs(asset), baseCcy, range)
      ),
      TE.map((assets) => calcAssetWeights(assets as EnrichedAsset[]))
    ) as Action<EnrichedAsset[]>;
  };

export const getOptionalAssetsEnricher =
  (yahooApi: YahooApi) =>
  (
    asset: Optional<GetAsset>,
    getAssetTxs: (after: Date) => Action<GetTx[]>,
    baseCcy: Ccy,
    range?: ChartRange
  ): Action<Optional<EnrichedAsset>> => {
    if (asset) {
      const enrichAsset = getAssetEnricher(yahooApi);
      return enrichAsset(asset, getAssetTxs, baseCcy, range);
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

const enrichWithTxs = (chart: ChartData, txs: GetTx[]): ChartData => {
  const earliestChartDate = fromUnixTime(chart[0].timestamp);
  const earliestTxDate = txs[0]?.date;
  if (!earliestTxDate) {
    // no transactions exist for this asset;
    // chart will just be showing price per 1 unit
    txs = [
      {
        ...defaultBuyTx(EARLIEST_DATE),
        quantity: 1,
        holdings: 1
      } as GetTx
    ];
  } else if (earliestTxDate > earliestChartDate) {
    // chart starts earlier than earliest transaction
    // chart will be showing zero units until first transaction is encountered
    txs = [
      {
        ...defaultBuyTx(EARLIEST_DATE),
        quantity: 0,
        holdings: 0
      } as GetTx,
      ...txs
    ];
  }

  let ci = 0;
  const res: ChartDataItem[] = [];
  for (let dp of chart) {
    let currentTx = txs[ci];
    const isLastTx = ci == txs.length - 1;
    if (isLastTx) {
      res.push({ ...dp, price: dp.price * currentTx.holdings });
      continue;
    }
    const nextTx = txs[ci + 1];
    if (dp.timestamp >= getUnixTime(nextTx.date)) {
      ci += 1;
      currentTx = nextTx;
    }
    res.push({ ...dp, price: dp.price * currentTx.holdings });
  }
  return res as ChartData;
};
