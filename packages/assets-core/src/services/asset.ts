import { fromUnixTime, getUnixTime } from "date-fns";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as NeA from "fp-ts/lib/NonEmptyArray";
import * as TE from "fp-ts/lib/TaskEither";
import { DEFAULT_CHART_RANGE, type ChartRange } from "../decoders/yahoo/meta";
import {
  buy,
  defaultBuyTx,
  EARLIEST_DATE,
  getToBase,
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
import { avg, change, pctOf, sum } from "../utils/finance";
import type { Action, Optional } from "../utils/utils";

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
      TE.bind("mktBaseRate", ({ origChart: { meta } }) =>
        yahooApi.baseCcyConversionRate(meta.currency, asset.base_ccy)
      ),
      TE.map(
        ({
          txs,
          origChart: { chart: origChart, price: rangePrice, meta },
          mktBaseRate
        }) => {
          const buyTxs = pipe(txs, A.filter(buy));
          const sellTxs = pipe(txs, A.filter(buy));

          const avgBuyRate =
            pipe(
              buyTxs,
              avg(({ base, contribution }) => base.rate * contribution)
            ) || mktBaseRate; //can be zero, so failsafing
          const avgSellRate =
            pipe(
              buyTxs,
              avg(({ base, contribution }) => base.rate * contribution)
            ) || mktBaseRate;

          const toMktBase = getToBase(mktBaseRate);
          const toAvgBuyBase = getToBase(avgBuyRate);
          const toAvgSellBase = getToBase(avgSellRate);

          const investedBase = toAvgBuyBase(asset.invested);
          const valueCcy = asset.holdings * rangePrice.current;
          const valueBase = toMktBase(valueCcy);

          const foreignAsset = meta.currency !== asset.base_ccy;

          const chartCcy: ChartData = enrichChart(origChart, txs);
          const chartBase: ChartData = pipe(
            chartCcy,
            NeA.map((dp) => ({
              ...dp,
              price: toMktBase(dp.price)
            }))
          );

          const totalsCcy: Totals = (() => {
            const [returnValue, returnPct] = change({
              before: asset.invested,
              after: valueCcy
            });

            return { returnValue, returnPct };
          })();

          const totalsBase: Totals = (() => {
            const [returnValue, returnPct] = change({
              before: investedBase,
              after: valueBase
            });
            return { returnValue, returnPct };
          })();

          const fxImpact = pipe(
            buyTxs,
            sum(({ base }) => base.fxImpact)
          );

          const realizedGain = pipe(
            sellTxs,
            sum(({ ccy }) => ccy.returnValue)
          );
          const realizedGainPct = pctOf(asset.invested, realizedGain);

          const realizedGainsBase = toAvgSellBase(realizedGain);
          const realizedGainPctBase = pctOf(investedBase, realizedGainsBase);

          const changesCcy: PeriodChanges = {
            // if no holdings, we consider price for 1 unit
            ...rangePrice,
            beginning: rangePrice.beginning * (asset.holdings || 1),
            current: rangePrice.current * (asset.holdings || 1)
          };

          const [returnValueBase, returnPctBase] = change({
            before: toMktBase(changesCcy.beginning),
            after: toMktBase(changesCcy.current)
          });

          const changesBase: PeriodChanges = {
            ...rangePrice,
            beginning: toMktBase(changesCcy.beginning),
            current: toMktBase(changesCcy.current),
            returnValue: returnValueBase,
            returnPct: returnPctBase
          };

          return {
            ...asset,
            meta,
            mktBaseRate,
            foreignAsset,
            weight: null, // cannot calc weight for single asset
            ccy: {
              chart: chartCcy,
              totals: totalsCcy,
              changes: changesCcy,
              realizedGain,
              realizedGainPct
            },
            base: {
              chart: chartBase,
              totals: totalsBase,
              changes: changesBase,
              invested: investedBase,
              realizedGain: realizedGainsBase,
              realizedGainPct: realizedGainPctBase,
              avgBuyRate,
              fxImpact
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
