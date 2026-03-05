import {
  DEFAULT_CHART_RANGE,
  sum,
  type Action,
  type ChartRange,
  type EnrichedAsset,
  type EnrichedTx,
  type GetAsset,
  type Optional
} from "@darkruby/assets-core";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { type YahooApi } from "../yahoo/client";
import { enrichedAssetBase, enrichedAssetCcy } from "./yahoo";

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
      TE.map(({ finalStretchTxs, fxRates, chart }) => {
        const { meta } = chart;
        const ccy = enrichedAssetCcy(asset, chart, finalStretchTxs);
        const base = enrichedAssetBase(
          asset,
          chart,
          finalStretchTxs,
          ccy,
          fxRates
        );

        return {
          ccy,
          base,
          meta,
          ...asset,
          weight: null // cannot calc weight for single asset
        } satisfies EnrichedAsset;
      })
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
