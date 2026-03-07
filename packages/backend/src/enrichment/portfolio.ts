import {
  byDuration,
  DEFAULT_CHART_RANGE,
  onEmpty,
  sum,
  unixNow,
  type Action,
  type ChartRange,
  type EnrichedPortfolio,
  type EnrichedTx,
  type GetAsset,
  type GetPortfolio,
  type Optional,
  type PeriodChanges,
  type Totals,
  type UnixDate
} from "@darkruby/assets-core";
import * as A from "fp-ts/lib/Array";
import { pipe, type FunctionN, type LazyArg } from "fp-ts/lib/function";
import * as Ord from "fp-ts/lib/Ord";
import * as TE from "fp-ts/lib/TaskEither";
import type { YahooApi } from "../yahoo/client";
import { calcAssetWeights, getAssetsEnricher } from "./asset";
import { combineAssetCharts, commonAssetRanges } from "./chart";

export const getPortfolioEnricher =
  (yahooApi: YahooApi) =>
  (
    portfolio: GetPortfolio,
    getAssets: LazyArg<Action<GetAsset[]>>,
    getEnrichedTxs: (asset: GetAsset) => Action<EnrichedTx[]>,
    range: ChartRange = DEFAULT_CHART_RANGE
  ): Action<EnrichedPortfolio> => {
    const enrichAssets = getAssetsEnricher(yahooApi);

    return pipe(
      TE.Do,
      TE.apS("portfolio", TE.of(portfolio)),
      TE.bind("assets", () =>
        pipe(
          getAssets(),
          TE.chain((a) => enrichAssets(a, getEnrichedTxs, range)),
          TE.map(A.filter((a) => Boolean(a.invested))),
          TE.map(calcAssetWeights)
        )
      ),
      TE.map(({ portfolio, assets }) => {
        const invested = pipe(
          assets,
          sum(({ base }) => base.invested)
        );

        const currencies = pipe(
          new Set<string>(assets.map((a) => a.meta.currency)).values(),
          Array.from<string>
        );
        const domestic = assets.reduce((d, a) => d && a.base.domestic, true);

        const realizedGain = pipe(
          //<-- rename to realizedPnl
          assets,
          sum(({ base }) => base.realizedPnl)
        );

        const fxImpact = pipe(
          assets,
          sum(({ base }) => base.fxImpact ?? 0)
        );

        const changes: PeriodChanges = (() => {
          const startPrice = pipe(
            assets,
            sum(({ base }) => base.changes.startPrice)
          );
          const endPrice = pipe(
            assets,
            sum(({ base }) => base.changes.endPrice)
          );

          const returnValue = pipe(
            assets,
            sum((a) => a.base.changes.returnValue)
          );
          const returnPct = pipe(
            assets,
            sum((a) => a.base.changes.returnPct * a.weight!)
          );
          const startTs = pipe(
            assets,
            A.map(({ base }) => base.changes.startTs),
            onEmpty(unixNow),
            (s) => Math.min(...s)
          ) as UnixDate;
          const endTs = pipe(
            assets,
            A.map(({ base }) => base.changes.endTs),
            onEmpty(unixNow),
            (s) => Math.max(...s)
          ) as UnixDate;

          return {
            startPrice,
            endPrice,
            returnValue,
            returnPct,
            startTs,
            endTs
          } satisfies PeriodChanges;
        })();

        const totals = ((): Totals => {
          const returnValue = pipe(
            assets,
            sum((a) => a.base.totals.returnValue)
          );
          const returnPct = pipe(
            assets,
            sum((a) => a.base.totals.returnPct * a.weight!)
          );
          return { returnValue, returnPct };
        })();

        const chart = combineAssetCharts(assets);

        const meta = (() => {
          const range = pipe(
            assets,
            A.map((a) => a.meta.range),
            A.reduce(DEFAULT_CHART_RANGE, Ord.max(byDuration))
          );
          const validRanges = commonAssetRanges(assets);
          return { range, validRanges };
        })();

        return {
          ...portfolio,
          meta,
          // weight cannot be calc
          // for single portfolio
          weight: 0,
          currencies,
          domestic,
          base: {
            changes,
            chart,
            invested,
            totals,
            realizedGain,
            fxImpact
          }
        };
      })
    );
  };

export const getPortfoliosEnricher =
  (yahooApi: YahooApi) =>
  (
    portfolios: GetPortfolio[],
    getAssets: FunctionN<[GetPortfolio], Action<GetAsset[]>>,
    getEnrichedTxs: FunctionN<[GetAsset, GetPortfolio], Action<EnrichedTx[]>>,
    range?: ChartRange
  ): Action<EnrichedPortfolio[]> => {
    const enrichPortfolio = getPortfolioEnricher(yahooApi);
    return pipe(
      portfolios,
      TE.traverseArray((p) => {
        const getTxs = (asset: GetAsset) => getEnrichedTxs(asset, p);
        return enrichPortfolio(p, () => getAssets(p), getTxs, range);
      }),
      TE.map((ps) => calcPortfolioWeights(ps as EnrichedPortfolio[]))
    );
  };

export const getOptionalPorfolioEnricher =
  (yahooApi: YahooApi) =>
  (
    portfolio: Optional<GetPortfolio>,
    getAssets: () => Action<GetAsset[]>,
    getEnrichedTxs: (asset: GetAsset) => Action<EnrichedTx[]>,
    range?: ChartRange
  ): Action<Optional<EnrichedPortfolio>> => {
    if (portfolio) {
      const enrichPortfolio = getPortfolioEnricher(yahooApi);
      return enrichPortfolio(portfolio, getAssets, getEnrichedTxs, range);
    }
    return TE.of(null);
  };

export const calcPortfolioWeights = (
  portfolios: EnrichedPortfolio[]
): EnrichedPortfolio[] => {
  const total = pipe(
    portfolios,
    sum(({ base }) => base.changes.endPrice)
  );
  return pipe(
    portfolios,
    A.map((p: EnrichedPortfolio) => {
      if (total > 0) {
        p.weight = p.base.changes.endPrice / total;
      }
      return p;
    })
  );
};
