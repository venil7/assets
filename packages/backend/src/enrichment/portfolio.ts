import {
  byDuration,
  DEFAULT_CHART_RANGE,
  max,
  min,
  sum,
  unique,
  volatility,
  type Action,
  type ChartRange,
  type EnrichedAsset,
  type EnrichedPortfolio,
  type GetPortfolio,
  type Optional,
  type PeriodChanges,
  type Totals,
  type UnixDate
} from "@darkruby/assets-core";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as Ord from "fp-ts/lib/Ord";
import * as TE from "fp-ts/lib/TaskEither";
import type { Repository } from "../repository";
import type { YahooApi } from "../yahoo/client";
import { calcAssetWeights, getAssetsEnricher } from "./asset";
import { combineAssetCharts, commonAssetRanges } from "./chart";

const sumInvested = sum<EnrichedAsset>(({ base }) => base.invested);
const sumRealizedPnl = sum<EnrichedAsset>(({ base }) => base.realizedPnl);
const sumFxImpact = sum<EnrichedAsset>(({ base }) => base.fxImpact ?? 0);
const sumBreakEven = sum<EnrichedAsset>(({ base }) => base.breakEven ?? 0);
const sumStartPrice = sum<EnrichedAsset>(({ base }) => base.changes.startPrice);
const sumEndPrice = sum<EnrichedAsset>(({ base }) => base.changes.endPrice);
const minStartTs = min<EnrichedAsset>(({ base }) => base.changes.startTs);
const maxEndTs = max<EnrichedAsset>(({ base }) => base.changes.endTs);
const sumReturnChangesValue = sum<EnrichedAsset>(
  ({ base }) => base.changes.returnValue
);
const sumChangesReturnPct = sum<EnrichedAsset>(
  ({ base, weight }) => base.changes.returnPct * (weight ?? 0)
);
const sumTotalsReturnValue = sum<EnrichedAsset>(
  ({ base }) => base.totals.returnValue
);
const sumTotalReturnPct = sum<EnrichedAsset>(
  ({ base, weight }) => base.totals.returnPct * (weight ?? 0)
);
const sum52wkLow = sum<EnrichedAsset>(({ meta }) => meta.fiftyTwoWeekLow);
const sum52wkHigh = sum<EnrichedAsset>(({ meta }) => meta.fiftyTwoWeekHigh);

const portfolioMeta = (assets: EnrichedAsset[]): EnrichedPortfolio["meta"] => {
  const fiftyTwoWeekLow = sum52wkLow(assets);
  const fiftyTwoWeekHigh = sum52wkHigh(assets);
  const [volatilityRange, volatilityPct] = volatility(
    fiftyTwoWeekLow,
    fiftyTwoWeekHigh
  );

  const currencies = pipe(
    assets,
    unique(({ meta }) => meta.currency)
  );
  const exchanges = pipe(
    assets,
    unique(({ meta }) => meta.exchangeName)
  );
  const types = pipe(
    assets,
    unique(({ meta }) => meta.instrumentType)
  );
  const range = pipe(
    assets,
    A.map((a) => a.meta.range),
    A.reduce(DEFAULT_CHART_RANGE, Ord.max(byDuration))
  );
  const validRanges = commonAssetRanges(assets);
  return {
    range,
    exchanges,
    types,
    currencies,
    validRanges,
    volatilityRange,
    volatilityPct,
    fiftyTwoWeekLow,
    fiftyTwoWeekHigh
  };
};

const portfolioChanges = (assets: EnrichedAsset[]): PeriodChanges => {
  const startPrice = sumStartPrice(assets);
  const endPrice = sumEndPrice(assets);
  const returnValue = sumReturnChangesValue(assets);
  const returnPct = sumChangesReturnPct(assets);

  const startTs = minStartTs(assets) as UnixDate;
  const endTs = maxEndTs(assets) as UnixDate;

  return {
    startPrice,
    endPrice,
    returnValue,
    returnPct,
    startTs,
    endTs
  } satisfies PeriodChanges;
};

const portfolioTotals = (assets: EnrichedAsset[]): Totals => {
  const returnValue = sumTotalsReturnValue(assets);
  const returnPct = sumTotalReturnPct(assets);
  return { returnValue, returnPct };
};

export const getPortfolioEnricher =
  (repo: Repository, yahooApi: YahooApi) =>
  (
    portfolio: GetPortfolio,
    range: ChartRange = DEFAULT_CHART_RANGE
  ): Action<EnrichedPortfolio> => {
    const enrichAssets = getAssetsEnricher(repo, yahooApi);

    return pipe(
      TE.Do,
      TE.apS("portfolio", TE.of(portfolio)),
      TE.bind("assets", () =>
        pipe(
          repo.asset.getAll(portfolio.id, portfolio.user_id),
          TE.chain((assets) => enrichAssets(assets, range)),
          TE.map(A.filter((a) => Boolean(a.invested))),
          TE.map(calcAssetWeights)
        )
      ),
      TE.map(({ portfolio, assets }) => {
        const domestic = assets.reduce((d, a) => d && a.base.domestic, true);
        const invested = sumInvested(assets);
        const realizedPnl = sumRealizedPnl(assets);
        const fxImpact = sumFxImpact(assets);
        const breakEven = sumBreakEven(assets);

        const meta = portfolioMeta(assets);
        const totals = portfolioTotals(assets);
        const changes = portfolioChanges(assets);
        const chart = combineAssetCharts(assets);

        return {
          ...portfolio,
          meta,
          // weight cannot be calc
          // for single portfolio
          weight: null,
          domestic,
          changes,
          chart,
          invested,
          breakEven,
          totals,
          realizedPnl,
          fxImpact
        } satisfies EnrichedPortfolio;
      })
    );
  };

export const getPortfoliosEnricher =
  (repo: Repository, yahooApi: YahooApi) =>
  (
    portfolios: GetPortfolio[],
    range?: ChartRange
  ): Action<EnrichedPortfolio[]> => {
    const enrichPortfolio = getPortfolioEnricher(repo, yahooApi);
    return pipe(
      portfolios,
      TE.traverseArray((p) => enrichPortfolio(p, range)),
      TE.map((ps) => calcPortfolioWeights(ps as EnrichedPortfolio[]))
    );
  };

export const getOptionalPorfolioEnricher =
  (repo: Repository, yahooApi: YahooApi) =>
  (
    portfolio: Optional<GetPortfolio>,
    range?: ChartRange
  ): Action<Optional<EnrichedPortfolio>> => {
    if (portfolio) {
      const enrichPortfolio = getPortfolioEnricher(repo, yahooApi);
      return enrichPortfolio(portfolio, range);
    }
    return TE.of(null);
  };

export const calcPortfolioWeights = (
  portfolios: EnrichedPortfolio[]
): EnrichedPortfolio[] => {
  const total = pipe(
    portfolios,
    sum(({ changes }) => changes.endPrice)
  );
  return pipe(
    portfolios,
    A.map((p: EnrichedPortfolio) => {
      if (total > 0) {
        p.weight = p.changes.endPrice / total;
      }
      return p;
    })
  );
};
