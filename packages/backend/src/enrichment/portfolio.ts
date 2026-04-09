import {
  byDuration,
  calcCumulativePnl,
  DEFAULT_CHART_RANGE,
  maxTs,
  minTs,
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
import type { AssetEnricher } from "./asset";
import {
  combineAssetCharts,
  commonAssetRanges,
  portfolioMultiChart
} from "./chart";

const sumInvested = sum<EnrichedAsset>(({ base }) => base.invested);
const sumRealizedPnl = sum<EnrichedAsset>(({ base }) => base.realizedPnl);
const sumFxImpact = sum<EnrichedAsset>(({ base }) => base.fxImpact ?? 0);
const sumBreakEven = sum<EnrichedAsset>(({ base }) => base.breakEven ?? 0);
const sumStartPrice = sum<EnrichedAsset>(({ base }) => base.changes.startPrice);
const sumEndPrice = sum<EnrichedAsset>(({ base }) => base.changes.endPrice);
const minStartTs = minTs<EnrichedAsset>(({ base }) => base.changes.startTs);
const maxEndTs = maxTs<EnrichedAsset>(({ base }) => base.changes.endTs);
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
  const startTs = minStartTs(assets) as UnixDate;
  const endTs = maxEndTs(assets) as UnixDate;

  const [returnValue, returnPct] = pipe(
    assets,
    calcCumulativePnl<EnrichedAsset>((a) => a.base.changes)
  );

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
  const [returnValue, returnPct] = pipe(
    assets,
    calcCumulativePnl<EnrichedAsset>((a) => a.base.totals)
  );
  return { returnValue, returnPct };
};

const getPortfolioEnricher =
  (repo: Repository, { enrichMany, calcAssetWeights }: AssetEnricher) =>
  (
    portfolio: GetPortfolio,
    range: ChartRange = DEFAULT_CHART_RANGE
  ): Action<EnrichedPortfolio> => {
    return pipe(
      TE.Do,
      TE.apS("portfolio", TE.of(portfolio)),
      TE.bind("assets", () =>
        pipe(
          repo.asset.getAll(portfolio.id, portfolio.user_id),
          TE.chain((assets) => enrichMany(assets, range)),
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
        const multiChart = portfolioMultiChart(assets);

        return {
          ...portfolio,
          meta,
          // weight cannot be calc
          // for single portfolio
          weight: null,
          domestic,
          changes,
          chart,
          multiChart,
          invested,
          breakEven,
          totals,
          realizedPnl,
          fxImpact
        } satisfies EnrichedPortfolio;
      })
    );
  };

const getPortfoliosEnricher =
  (repo: Repository, assetEnricher: AssetEnricher) =>
  (
    portfolios: GetPortfolio[],
    range?: ChartRange
  ): Action<EnrichedPortfolio[]> => {
    const enrichPortfolio = getPortfolioEnricher(repo, assetEnricher);
    return pipe(
      portfolios,
      TE.traverseArray((p) => enrichPortfolio(p, range)),
      TE.map((ps) => calcPortfolioWeights(ps as EnrichedPortfolio[]))
    );
  };

export const getOptionalPorfolioEnricher =
  (repo: Repository, assetEnricher: AssetEnricher) =>
  (
    portfolio: Optional<GetPortfolio>,
    range?: ChartRange
  ): Action<Optional<EnrichedPortfolio>> => {
    if (portfolio) {
      const enrichPortfolio = getPortfolioEnricher(repo, assetEnricher);
      return enrichPortfolio(portfolio, range);
    }
    return TE.of(null);
  };

const calcPortfolioWeights = (
  portfolios: EnrichedPortfolio[]
): EnrichedPortfolio[] => {
  const total = pipe(
    portfolios,
    sum(({ invested }) => invested)
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

export type PortfolioEnricher = ReturnType<typeof createPortfolioEnricher>;

export const createPortfolioEnricher = (
  repo: Repository,
  assetEnricher: AssetEnricher
) => {
  return {
    enrich: getPortfolioEnricher(repo, assetEnricher),
    enrichMany: getPortfoliosEnricher(repo, assetEnricher),
    enrichMaybe: getOptionalPorfolioEnricher(repo, assetEnricher),
    calcPortfolioWeights
  };
};
