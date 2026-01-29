import * as A from "fp-ts/lib/Array";
import { pipe, type FunctionN, type LazyArg } from "fp-ts/lib/function";
import * as Ord from "fp-ts/lib/Ord";
import * as TE from "fp-ts/lib/TaskEither";
import {
  byDuration,
  DEFAULT_CHART_RANGE,
  type ChartRange
} from "../decoders/yahoo/meta";
import type {
  EnrichedPortfolio,
  EnrichedTx,
  GetAsset,
  GetPortfolio,
  PeriodChanges,
  Totals,
  UnixDate
} from "../domain";
import type { YahooApi } from "../http";
import { onEmpty } from "../utils/array";
import { unixNow } from "../utils/date";
import { change, sum } from "../utils/finance";
import type { Action, Optional } from "../utils/utils";
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
      TE.bind("assets", () => {
        return pipe(
          getAssets(),
          TE.chain((a) => enrichAssets(a, getEnrichedTxs, range)),
          TE.map(calcAssetWeights)
        );
      }),
      TE.map(({ portfolio, assets }) => {
        const investedBase = pipe(
          assets,
          sum(({ base }) => base.invested)
        );

        const value: PeriodChanges = (() => {
          const beginning = pipe(
            assets,
            sum(({ base }) => base.changes.beginning)
          );
          const current = pipe(
            assets,
            sum(({ base }) => base.changes.current)
          );

          const [returnValue, returnPct] = change({
            before: beginning,
            after: current
          });
          const start = pipe(
            assets,
            A.map(({ ccy }) => ccy.changes.start),
            onEmpty(unixNow),
            (s) => Math.min(...s)
          ) as UnixDate;
          const end = pipe(
            assets,
            A.map(({ ccy }) => ccy.changes.end),
            onEmpty(unixNow),
            (s) => Math.max(...s)
          ) as UnixDate;

          return {
            beginning,
            current,
            returnValue,
            returnPct,
            start,
            end
          };
        })();

        const totals = ((): Totals => {
          const [returnValue, returnPct] = change({
            before: investedBase,
            after: value.current
          });

          return { returnValue, returnPct };
        })();

        const chart = combineAssetCharts(assets.filter((a) => a.holdings > 0));

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
          investedBase,
          value,
          totals,
          chart,
          meta,
          // weight cannot be calc
          // for single portfolio
          weight: 0
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
    sum(({ value }) => value.current)
  );
  return pipe(
    portfolios,
    A.map((p: EnrichedPortfolio) => {
      if (total > 0) {
        p.weight = p.value.current / total;
      }
      return p;
    })
  );
};
