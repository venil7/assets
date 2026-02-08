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
      TE.bind("origChart", () => yahooApi.chart(asset.ticker, range)),
      TE.bind("txs", getTxs),
      TE.bind("mktFxRate", ({ origChart: { meta } }) =>
        // possibly optimize by taking from tx
        yahooApi.baseCcyConversionRate(meta.currency, asset.base_ccy)
      ),
      TE.map(
        ({ txs, origChart: { chart, periodChanges, meta }, mktFxRate }) => {
          const buyTxs = pipe(txs, A.filter(byBuy));
          const sellTxs = pipe(txs, A.filter(bySell));
          // transactions
          const prePeriodTxs = pipe(
            txs,
            txsAfterTimestamp(periodChanges.start)
          );
          const periodTxs = prePeriodTxs.slice(1);
          console.log(prePeriodTxs.length, periodTxs.length);

          const avgBuyRate =
            pipe(
              buyTxs,
              sum(({ base, contribution }) => base.fxRate * contribution)
            ) || mktFxRate.rate; //can be zero, so failsafing

          // const avgSellRate =
          //   pipe(
          //     buyTxs,
          //     sum(({ base, contribution }) => base.fxRate * contribution)
          //   ) || mktFxRate.rate;

          const domestic =
            meta.currency.toUpperCase() == asset.base_ccy.toUpperCase();

          // Ccy
          const valueCcy = asset.holdings * periodChanges.current;
          const chartCcy: ChartData = enrichChart(chart, txs);

          const changesCcy: PeriodChanges = (() => {
            // if no holdings, we consider price for 1 unit
            const valuePeriodBeginning =
              periodChanges.beginning * (prePeriodTxs[0]?.holdings || 1);
            const currentValue = periodChanges.current * (asset.holdings || 1);

            const [rawReturn, rawReturnPct] = change({
              before: valuePeriodBeginning,
              after: currentValue
            });
            // periodReturn = (quantityAtPeriodStart * priceAtPeriodStart)-(quantityAtPeriodEnd * priceAtPeriodEnd) - sum(periodTxs.quantity_ext)
            // periodReturnPct = periodReturn/currentValue
            const returnValue = rawReturn;
            const returnPct = rawReturnPct;
            return {
              ...periodChanges,
              returnValue,
              returnPct,
              beginning: valuePeriodBeginning,
              current: currentValue
            };
          })();

          const totalsCcy: Totals = (() => {
            const [returnValue, returnPct] = change({
              before: asset.invested,
              after: valueCcy
            });

            return { returnValue, returnPct };
          })();

          const realizedGainCcy = pipe(
            sellTxs,
            sum(({ ccy }) => ccy.returnValue)
          );
          const realizedGainPctCcy = pctOf(asset.invested, realizedGainCcy);

          const ccy: EnrichedAsset["ccy"] = {
            chart: chartCcy,
            totals: totalsCcy,
            changes: changesCcy,
            realizedGain: realizedGainCcy,
            realizedGainPct: realizedGainPctCcy
          };

          // Base
          const toMktBase = getToBase(mktFxRate.rate);
          const toAvgBuyBase = getToBase(avgBuyRate);
          // const toAvgSellBase = getToBase(avgSellRate); // ?

          const avgPriceBase = pipe(asset.avg_price, maybe(toAvgBuyBase));
          const investedBase = toAvgBuyBase(asset.invested);
          const valueBase = toMktBase(valueCcy);

          const chartBase: ChartData = pipe(
            chartCcy,
            NeA.map((dp) => ({
              ...dp,
              price: toMktBase(dp.price)
            }))
          );

          const totalsBase: Totals = (() => {
            const [returnValue, returnPct] = change({
              before: investedBase,
              after: valueBase
            });
            return { returnValue, returnPct };
          })();

          const fxImpact = pipe(
            buyTxs,
            sum(({ base }) => base.fxImpact ?? 0)
          );

          const realizedGainsBase = pipe(
            sellTxs,
            sum(({ base }) => base.returnValue)
          );
          const realizedGainPctBase = pctOf(investedBase, realizedGainsBase);

          const changesBase: PeriodChanges = (() => {
            const beginningBase = toMktBase(changesCcy.beginning);
            const currentBase = toMktBase(changesCcy.current);
            const [returnValueBase, returnPctBase] = change({
              before: beginningBase,
              after: currentBase
            });
            return {
              ...periodChanges,
              returnValue: returnValueBase,
              returnPct: returnPctBase,
              beginning: beginningBase,
              current: currentBase
            };
          })();

          const base: EnrichedAsset["base"] = {
            chart: chartBase,
            totals: totalsBase,
            changes: changesBase,
            invested: investedBase,
            realizedGain: realizedGainsBase,
            realizedGainPct: realizedGainPctBase,
            avgBuyRate,
            avgPrice: avgPriceBase,
            fxImpact
          };

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
