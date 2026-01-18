import * as A from "fp-ts/lib/Array";
import { pipe, type FunctionN, type LazyArg } from "fp-ts/lib/function";
import * as Ord from "fp-ts/lib/Ord";
import * as TE from "fp-ts/lib/TaskEither";
import type { Ccy } from "../decoders";
import {
  ChartRangeOrd,
  DEFAULT_CHART_RANGE,
  type ChartRange
} from "../decoders/yahoo/meta";
import type {
  EnrichedPortfolio,
  GetAsset,
  GetPortfolio,
  GetTx,
  PeriodChanges,
  Totals,
  UnixDate
} from "../domain";
import type { YahooApi } from "../http";
import { onEmpty } from "../utils/array";
import { unixNow } from "../utils/date";
import { changeInPct, changeInValue, sum } from "../utils/finance";
import type { Action, Optional } from "../utils/utils";
import { calcAssetWeights, getAssetsEnricher } from "./asset";
import { combineAssetCharts, commonAssetRanges } from "./chart";

export const getPortfolioEnricher =
  (yahooApi: YahooApi) =>
  (
    portfolio: GetPortfolio,
    getAssets: LazyArg<Action<GetAsset[]>>,
    getAssetTxs: (asset: GetAsset, after: Date) => Action<GetTx[]>,
    baseCcy: Ccy,
    range: ChartRange = DEFAULT_CHART_RANGE
  ): Action<EnrichedPortfolio> => {
    const enrichAssets = getAssetsEnricher(yahooApi);

    return pipe(
      TE.Do,
      TE.apS("portfolio", TE.of(portfolio)),
      TE.bind("assets", () => {
        return pipe(
          getAssets(),
          TE.chain((a) => enrichAssets(a, getAssetTxs, baseCcy, range)),
          TE.map(calcAssetWeights)
        );
      }),
      TE.map(({ portfolio, assets }) => {
        const investedBase = pipe(
          assets,
          sum(({ investedBase }) => investedBase)
        );

        const value: PeriodChanges = (() => {
          const beginning = pipe(
            assets,
            sum(({ value }) => value.base.beginning)
          );
          const current = pipe(
            assets,
            sum(({ value }) => value.base.current)
          );

          const change = changeInValue({ before: beginning, after: current });
          const changePct = changeInPct({ before: beginning, after: current });
          const start = pipe(
            assets,
            A.map(({ value }) => value.ccy.start),
            onEmpty(unixNow),
            (s) => Math.min(...s)
          ) as UnixDate;
          const end = pipe(
            assets,
            A.map(({ value }) => value.ccy.end),
            onEmpty(unixNow),
            (s) => Math.max(...s)
          ) as UnixDate;

          return {
            beginning,
            current,
            change,
            changePct,
            start,
            end
          };
        })();

        const totals = ((): Totals => {
          const change = changeInValue({
            before: investedBase,
            after: value.current
          });
          const changePct = changeInPct({
            before: investedBase,
            after: value.current
          });
          return { change, changePct };
        })();

        const chart = combineAssetCharts(assets);

        const meta = (() => {
          const range = pipe(
            assets,
            A.map((a) => a.meta.range),
            A.reduce(DEFAULT_CHART_RANGE, Ord.max(ChartRangeOrd))
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
    getAssetTxs: (asset: GetAsset, after: Date) => Action<GetTx[]>,
    baseCcy: Ccy,
    range?: ChartRange
  ): Action<EnrichedPortfolio[]> => {
    const enrichPortfolio = getPortfolioEnricher(yahooApi);
    return pipe(
      portfolios,
      TE.traverseArray((p) =>
        enrichPortfolio(p, () => getAssets(p), getAssetTxs, baseCcy, range)
      ),
      TE.map((ps) => calcPortfolioWeights(ps as EnrichedPortfolio[]))
    );
  };

export const getOptionalPorfolioEnricher =
  (yahooApi: YahooApi) =>
  (
    portfolio: Optional<GetPortfolio>,
    getAssets: () => Action<GetAsset[]>,
    getAssetTxs: (asset: GetAsset, after: Date) => Action<GetTx[]>,
    baseCcy: Ccy,
    range?: ChartRange
  ): Action<Optional<EnrichedPortfolio>> => {
    if (portfolio) {
      const enrichPortfolio = getPortfolioEnricher(yahooApi);
      return enrichPortfolio(portfolio, getAssets, getAssetTxs, baseCcy, range);
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
