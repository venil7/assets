import { fromUnixTime, getUnixTime } from "date-fns";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as NeA from "fp-ts/lib/NonEmptyArray";
import * as TE from "fp-ts/lib/TaskEither";
import { DEFAULT_CHART_RANGE, type ChartRange } from "../decoders/yahoo/meta";
import {
  byBuy,
  bySell,
  defaultBuyTx,
  EARLIEST_DATE,
  earliestTxBeforeTimestamp,
  getToBase,
  txsAfterTimestamp,
  type ChartData,
  type ChartDataItem,
  type EnrichedAsset,
  type EnrichedTx,
  type GetAsset,
  type GetTx,
  type PeriodChanges,
  type Totals
} from "../domain";
import type { YahooApi } from "../http";
import { unixNow } from "../utils/date";
import { change, pctOf, sum } from "../utils/finance";
import { maybe } from "../utils/func";
import { type Action, type Optional } from "../utils/utils";

export const getAssetEnricher =
  (yahooApi: YahooApi) =>
  (
    asset: GetAsset,
    getTxs: () => Action<EnrichedTx[]>,
    range: ChartRange = DEFAULT_CHART_RANGE
  ): Action<EnrichedAsset> => {
    return pipe(
      TE.Do,
      TE.bind("chart", () => yahooApi.chart(asset.ticker, range)),
      TE.bind("txs", getTxs),
      TE.bind("mktFxRate", ({ chart: { meta } }) =>
        // possibly optimize by taking from tx
        yahooApi.baseCcyConversionRate(meta.currency, asset.base_ccy)
      ),
      TE.map(
        ({
          txs,
          chart: { chart: origChart, periodChanges, meta },
          mktFxRate
        }) => {
          const buyTxs = pipe(txs, A.filter(byBuy));
          const sellTxs = pipe(txs, A.filter(bySell));
          const buyTxsTotalCost = sum<EnrichedTx>(({ ccy }) => ccy.cost)(
            buyTxs
          );
          // transactions
          const beforePeriodTx = pipe(
            txs,
            earliestTxBeforeTimestamp(periodChanges.start)
          );
          const periodTxs = pipe(txs, txsAfterTimestamp(periodChanges.start));

          const domestic =
            meta.currency.toUpperCase() == asset.base_ccy.toUpperCase();

          const ccy = ((): EnrichedAsset["ccy"] => {
            const value = asset.holdings * periodChanges.current;
            const chart: ChartData = enrichChart(origChart, txs);
            const totals: Totals = (() => {
              const [returnValue, returnPct] = change({
                before: asset.invested,
                after: value
              });
              return { returnValue, returnPct };
            })();
            const changes: PeriodChanges = (() => {
              const beginning =
                periodChanges.beginning *
                // if no holdings, we assume that holding is 1,
                (asset.holdings ? (beforePeriodTx?.holdings ?? 0) : 1);
              const current = periodChanges.current * (asset.holdings || 1);
              const periodTxsCost = sum<EnrichedTx>((tx) => tx.ccy.cost)(
                periodTxs
              );
              const returnValue = current - beginning - periodTxsCost;
              const returnPct = pctOf(current, returnValue);

              return {
                ...periodChanges,
                returnValue,
                returnPct,
                beginning,
                current
              };
            })();

            const realizedGain = pipe(
              sellTxs,
              sum(({ ccy }) => ccy.returnValue),
              Math.abs
            );
            const realizedGainPct = pctOf(buyTxsTotalCost, realizedGain);
            return {
              chart,
              totals,
              changes,
              realizedGain,
              realizedGainPct
            };
          })();

          const base: EnrichedAsset["base"] = (() => {
            const avgBuyRate =
              pipe(
                buyTxs,
                sum(
                  ({ base, ccy }) => base.fxRate * (ccy.cost / buyTxsTotalCost)
                )
              ) || mktFxRate.rate; // can be zero, so failsafing

            const toMktBase = getToBase(mktFxRate.rate);
            const toAvgBuyBase = getToBase(avgBuyRate);

            const avgPrice = pipe(asset.avg_price, maybe(toAvgBuyBase));
            const invested = toAvgBuyBase(asset.invested);
            const value = asset.holdings ? toMktBase(ccy.changes.current) : 0;

            const chart: ChartData = pipe(
              ccy.chart,
              NeA.map((dp) => ({
                ...dp,
                price: toMktBase(dp.price)
              }))
            );

            const totals: Totals = (() => {
              const [returnValue, returnPct] = change({
                before: invested,
                after: value
              });
              return { returnValue, returnPct };
            })();

            const buyTxsTotalCostBase = sum<EnrichedTx>(
              ({ base }) => base.cost
            )(buyTxs);

            const fxImpact = pipe(
              buyTxs,
              sum(({ base }) => base.fxImpact ?? 0)
            );

            const realizedGain = pipe(
              sellTxs,
              sum(({ base }) => base.returnValue),
              Math.abs
            );
            const realizedGainPct = pctOf(buyTxsTotalCostBase, realizedGain);

            const changes: PeriodChanges = (() => {
              const beginning = toMktBase(ccy.changes.beginning);
              const current = toMktBase(ccy.changes.current);
              const periodTxsCost = sum<EnrichedTx>((tx) => tx.base.cost)(
                periodTxs
              );
              const returnValue = current - beginning - periodTxsCost;
              const returnPct = pctOf(current, returnValue);
              return {
                ...periodChanges,
                returnValue,
                returnPct,
                beginning,
                current
              };
            })();

            return {
              chart,
              totals,
              changes,
              fxImpact,
              invested,
              avgPrice,
              avgBuyRate,
              realizedGain,
              realizedGainPct
            };
          })();

          return {
            ...asset,
            meta,
            mktFxRate: mktFxRate.rate,
            domestic,
            weight: null, // cannot calc weight for single asset
            ccy,
            base
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
        holdings: 1
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
        holdings: 0
      } as GetTx,
      ...txs
    ];
  }

  const res: ChartDataItem[] = [];
  for (let dp of chart) {
    let currentTx = txs[txi];
    const isLastTx = txi == txs.length - 1;
    if (isLastTx) {
      res.push({ ...dp, price: dp.price * currentTx.holdings });
      continue;
    }
    const nextTx = txs[txi + 1];
    if (dp.timestamp >= getUnixTime(nextTx.date)) {
      txi += 1;
      currentTx = nextTx;
    }
    res.push({ ...dp, price: dp.price * currentTx.holdings });
  }
  return res as ChartData;
};
