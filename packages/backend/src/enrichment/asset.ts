import {
  DEFAULT_CHART_RANGE,
  sum,
  volatility,
  type Action,
  type ChartRange,
  type EnrichedAsset,
  type GetAsset,
  type Optional
} from "@darkruby/assets-core";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import type { Repository } from "../repository";
import { type YahooApi } from "../yahoo/client";
import { $enrichedAssetBase, $enrichedAssetCcy, txsWithRates } from "./returns";
import { getTxsEnricher } from "./tx";

export const getAssetEnricher =
  (repo: Repository, yahooApi: YahooApi) =>
  (
    asset: GetAsset,
    range: ChartRange = DEFAULT_CHART_RANGE
  ): Action<EnrichedAsset> => {
    const enrichTxs = getTxsEnricher(yahooApi);
    return pipe(
      TE.Do,
      TE.bind("chart", () => yahooApi.chart(asset.ticker, range)),
      TE.bind("txs", () => repo.tx.getAll(asset.id, asset.user_id, false)),
      TE.bind("enrichedTxs", ({ txs }) => enrichTxs(txs)),
      TE.bind("fxRates", ({ chart }) =>
        yahooApi.fxRates(chart.meta.currency, asset.base_ccy)
      ),
      TE.map(({ enrichedTxs, fxRates, chart }) => {
        const { meta } = chart;
        const [volatilityRange, volatilityPct] = volatility(
          meta.fiftyTwoWeekLow,
          meta.fiftyTwoWeekHigh
        );

        const $txsWithRate = txsWithRates(enrichedTxs, fxRates);
        const ccy = $enrichedAssetCcy(asset, chart, $txsWithRate);
        const base = $enrichedAssetBase(
          asset,
          chart,
          $txsWithRate,
          ccy,
          fxRates
        );

        return {
          ccy,
          base,
          meta,
          volatilityRange,
          volatilityPct,
          ...asset,
          weight: null // cannot calc weight for single asset
        } satisfies EnrichedAsset;
      })
    );
  };

export const getAssetsEnricher =
  (repo: Repository, yahooApi: YahooApi) =>
  (assets: GetAsset[], range?: ChartRange): Action<EnrichedAsset[]> => {
    const enrichAsset = getAssetEnricher(repo, yahooApi);
    return pipe(
      assets,
      TE.traverseArray((asset) => enrichAsset(asset, range)),
      TE.map((assets) => calcAssetWeights(assets as EnrichedAsset[]))
    ) as Action<EnrichedAsset[]>;
  };

export const getOptionalAssetEnricher =
  (repo: Repository, yahooApi: YahooApi) =>
  (
    asset: Optional<GetAsset>,
    range?: ChartRange
  ): Action<Optional<EnrichedAsset>> => {
    if (asset) {
      const enrichAsset = getAssetEnricher(repo, yahooApi);
      return enrichAsset(asset, range);
    }
    return TE.of(null);
  };

export const calcAssetWeights = (assets: EnrichedAsset[]): EnrichedAsset[] => {
  const total = pipe(
    assets,
    sum(({ base }) => base.changes.endPrice)
  );
  return pipe(
    assets,
    A.map((asset) => {
      if (total > 0) {
        asset.weight = asset.base.changes.endPrice / total;
      }
      return asset;
    })
  );
};
