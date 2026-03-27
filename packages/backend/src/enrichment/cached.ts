import {
  DEFAULT_CHART_RANGE,
  type ChartRange,
  type GetAsset,
  type GetPortfolio,
  type GetTx,
  type Optional
} from "@darkruby/assets-core";
import ms from "ms";
import type { Repository } from "../repository";
import type { AppCache } from "../services/cache";
import type { YahooApi } from "../yahoo/client";
import { createAssetEnricher, type AssetEnricher } from "./asset";
import { createPortfolioEnricher, type PortfolioEnricher } from "./portfolio";
import { createSummaryEnricher, type SummaryEnricher } from "./summary";
import { createTxEnricher, type TxEnricher } from "./tx";

export type Enricher = {
  tx: TxEnricher;
  asset: AssetEnricher;
  portfolio: PortfolioEnricher;
  summary: SummaryEnricher;
};

export const createEnricher = (
  repo: Repository,
  yahooApi: YahooApi,
  cache: AppCache
): Enricher => {
  const ENRICH_TTL = ms("1min");

  const txEnricher = createTxEnricher(yahooApi);
  const cachedTxEnricher = {
    ...txEnricher,
    enrich: (tx: GetTx) => {
      const key = `enrich-tx-${tx.id}`;
      const action = () => txEnricher.enrich(tx);
      return cache.cachedAction(key, action, ENRICH_TTL);
    },
    enrichMany: (txs: GetTx[]) => {
      const key = `enrich-txs-${txs.map((tx) => tx.id).join("-")}`;
      const action = () => txEnricher.enrichMany(txs);
      return cache.cachedAction(key, action, ENRICH_TTL);
    }
  };

  const assetEnricher = createAssetEnricher(repo, yahooApi, cachedTxEnricher);
  const cachedAssetEnricher = {
    ...assetEnricher,
    enrich: (asset: GetAsset, range: ChartRange = DEFAULT_CHART_RANGE) => {
      const key = `enrich-asset-${asset.id}-${range}`;
      const action = () => assetEnricher.enrich(asset, range);
      return cache.cachedAction(key, action, ENRICH_TTL);
    },
    enrichMaybe: (
      asset: Optional<GetAsset>,
      range: ChartRange = DEFAULT_CHART_RANGE
    ) => {
      const key = `enrich-asset-${asset?.id}-${range}`;
      const action = () => assetEnricher.enrichMaybe(asset, range);
      return cache.cachedAction(key, action, ENRICH_TTL);
    },
    enrichMany: (
      assets: GetAsset[],
      range: ChartRange = DEFAULT_CHART_RANGE
    ) => {
      const key = `enrich-assets-${assets.map((a) => a.id).join("-")}-${range}`;
      const action = () => assetEnricher.enrichMany(assets, range);
      return cache.cachedAction(key, action, ENRICH_TTL);
    }
  };

  const portfolioEnricher = createPortfolioEnricher(repo, cachedAssetEnricher);
  const cachedPortfolioEnricher = {
    ...portfolioEnricher,
    enrich: (
      portfolio: GetPortfolio,
      range: ChartRange = DEFAULT_CHART_RANGE
    ) => {
      const key = `enrich-asset-${portfolio.id}-${range}`;
      const action = () => portfolioEnricher.enrich(portfolio, range);
      return cache.cachedAction(key, action, ENRICH_TTL);
    },
    enrichMaybe: (
      portfolio: Optional<GetPortfolio>,
      range: ChartRange = DEFAULT_CHART_RANGE
    ) => {
      const key = `enrich-asset-${portfolio?.id}-${range}`;
      const action = () => portfolioEnricher.enrichMaybe(portfolio, range);
      return cache.cachedAction(key, action, ENRICH_TTL);
    },
    enrichMany: (
      portfolios: GetPortfolio[],
      range: ChartRange = DEFAULT_CHART_RANGE
    ) => {
      const key = `enrich-portfolio-${portfolios.map((p) => p.id).join("-")}-${range}`;
      const action = () => portfolioEnricher.enrichMany(portfolios, range);
      return cache.cachedAction(key, action, ENRICH_TTL);
    }
  };
  const summaryEnricher = createSummaryEnricher();

  return {
    tx: cachedTxEnricher,
    asset: cachedAssetEnricher,
    portfolio: cachedPortfolioEnricher,
    summary: { ...summaryEnricher }
  };
};
