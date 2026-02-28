import { fromUnixTime, getUnixTime } from "date-fns";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { defaultTotals } from "../decoders";
import { DEFAULT_CHART_RANGE, type ChartRange } from "../decoders/yahoo/meta";
import {
  chartInBaseCcy,
  defaultBuyTx,
  EARLIEST_DATE,
  earliestTxBeforeTimestamp,
  periodChanges,
  txsAfterTimestamp,
  type ChartData,
  type ChartDataItem,
  type EnrichedAsset,
  type EnrichedAssetBase,
  type EnrichedAssetCcy,
  type EnrichedTx,
  type GetAsset,
  type GetTx
} from "../domain";
import type { YahooApi } from "../http";
import { unixNow } from "../utils/date";
import { change, sum } from "../utils/finance";
import { type Action, type Optional } from "../utils/utils";

export const getAssetEnricher =
  (yahooApi: YahooApi) =>
  (
    asset: GetAsset,
    getFinalStrecthTxs: () => Action<EnrichedTx[]>,
    range: ChartRange = DEFAULT_CHART_RANGE
  ): Action<EnrichedAsset> => {
    return pipe(
      TE.Do,
      TE.bind("chart", () => yahooApi.chart(asset.ticker, range)),
      TE.bind("finalStretchTxs", getFinalStrecthTxs),
      TE.bind("fxRates", ({ chart }) =>
        yahooApi.fxRates(chart.meta.currency, asset.base_ccy)
      ),
      TE.map(
        ({
          finalStretchTxs,
          fxRates,
          chart: { chart: origChart, periodChanges: assetPeriodChanges, meta }
        }) => {
          const domestic =
            meta.currency.toUpperCase() == asset.base_ccy.toUpperCase();

          // asset has no active investemnt
          if (!finalStretchTxs.length) {
            const ccy: EnrichedAssetCcy = {
              chart: origChart,
              changes: assetPeriodChanges,
              totals: defaultTotals()
            };
            const base: EnrichedAssetBase = {
              fxRate: 1,
              invested: 0,
              fxImpact: 0,
              breakEven: 0,
              avgPrice: null,
              realizedPnl: 0,
              totals: defaultTotals(),
              chart: chartInBaseCcy(origChart, fxRates),
              changes: periodChanges([], assetPeriodChanges, fxRates)
            };

            return {
              ccy,
              base,
              meta,
              domestic,
              weight: null,
              ...asset
            };
          }

          // an active stretch of investments is present
          const beforePeriodStartTx = pipe(
            finalStretchTxs,
            earliestTxBeforeTimestamp(assetPeriodChanges.start)
          );
          const duringPeriodTxs = pipe(
            finalStretchTxs,
            txsAfterTimestamp(assetPeriodChanges.start)
          );
          const periodStretchTxs: EnrichedTx[] = [
            ...(beforePeriodStartTx ? [beforePeriodStartTx] : []),
            ...duringPeriodTxs
          ];

          const ccy = ((): EnrichedAssetCcy => {
            const value = asset.holdings * meta.regularMarketPrice;
            const [returnValue, returnPct] = change({
              before: asset.invested,
              after: value
            });
            return {
              totals: { returnValue, returnPct },
              chart: enrichChart(origChart, finalStretchTxs),
              changes: periodChanges(periodStretchTxs, assetPeriodChanges)
            };
          })();

          const domesticBase = {
            ...ccy,
            fxRate: 1,
            fxImpact: 0,
            invested: asset.invested,
            avgPrice: asset.avg_price,
            breakEven: asset.break_even,
            realizedPnl: asset.realized_pnl
          };
          const base = domestic
            ? domesticBase
            : domesticBase; /*foreignAssetBaseCalc(
                periodStretchTxs,
                assetPeriodChanges,
                fxRates
              );*/

          return {
            ccy,
            base,
            meta,
            ...asset,
            domestic,
            weight: null // cannot calc weight for single asset
          };
        }
      )
    );
  };

export const getAssetsEnricher =
  (yahooApi: YahooApi) =>
  (
    assets: GetAsset[],
    getEnrichedTxs: (asset: GetAsset) => Action<EnrichedTx[]>,
    range?: ChartRange
  ): Action<EnrichedAsset[]> => {
    const assetTxs = (asset: GetAsset) => () => getEnrichedTxs(asset);
    const enrichAsset = getAssetEnricher(yahooApi);
    return pipe(
      assets,
      TE.traverseArray((asset) => enrichAsset(asset, assetTxs(asset), range)),
      TE.map((assets) => calcAssetWeights(assets as EnrichedAsset[]))
    ) as Action<EnrichedAsset[]>;
  };

export const getOptionalAssetEnricher =
  (yahooApi: YahooApi) =>
  (
    asset: Optional<GetAsset>,
    getEnrichedTxs: () => Action<EnrichedTx[]>,
    range?: ChartRange
  ): Action<Optional<EnrichedAsset>> => {
    if (asset) {
      const enrichAsset = getAssetEnricher(yahooApi);
      return enrichAsset(asset, getEnrichedTxs, range);
    }
    return TE.of(null);
  };

export const calcAssetWeights = (assets: EnrichedAsset[]): EnrichedAsset[] => {
  const total = pipe(
    assets,
    sum(({ base }) => base.changes.current)
  );
  return pipe(
    assets,
    A.map((asset) => {
      if (total > 0) {
        asset.weight = asset.base.changes.current / total;
      }
      return asset;
    })
  );
};

const enrichChart = (chart: ChartData, txs: GetTx[]): ChartData => {
  let txi = 0; // current tx index

  const earliestChartDate = fromUnixTime(chart[0]?.timestamp ?? unixNow());
  const earliestTxDate = txs[0]?.date;
  if (!earliestTxDate) {
    // no transactions exist for this asset;
    // chart will just be showing price per 1 unit
    txs = [
      {
        ...defaultBuyTx(EARLIEST_DATE),
        quantity: 1,
        running_holding: 1
      } as GetTx
    ];
  }
  if (earliestTxDate < earliestChartDate) {
    // there are transaction earlier that chart begins
    // we need to fast forward until tx just before chart begins
    while (
      txi + 1 < txs.length &&
      getUnixTime(txs[txi + 1].date) < chart[0].timestamp
    ) {
      txi += 1;
    }
  }
  if (earliestTxDate > earliestChartDate) {
    // chart starts earlier than earliest transaction
    // chart will be showing zero units until first transaction is encountered
    txs = [
      {
        ...defaultBuyTx(EARLIEST_DATE),
        // quantity: 0,
        running_holding: 0
      } as GetTx,
      ...txs
    ];
  }

  const res: ChartDataItem[] = [];
  for (let dp of chart) {
    let currentTx = txs[txi];
    const isLastTx = txi == txs.length - 1;
    if (isLastTx) {
      res.push({ ...dp, price: dp.price * currentTx.running_holding });
      continue;
    }
    const nextTx = txs[txi + 1];
    if (dp.timestamp >= getUnixTime(nextTx.date)) {
      txi += 1;
      currentTx = nextTx;
    }
    res.push({ ...dp, price: dp.price * currentTx.running_holding });
  }
  return res as ChartData;
};
