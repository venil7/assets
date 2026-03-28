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
import { key } from "./key";
import { createPortfolioEnricher, type PortfolioEnricher } from "./portfolio";
import { createSummaryEnricher, type SummaryEnricher } from "./summary";
import { createTxEnricher, type TxEnricher } from "./tx";

const txKey = key("enrich-tx");
const assetKey = key("enrich-asset");
const portfolioKey = key("enrich-portfolio");

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
      const action = () => txEnricher.enrich(tx);
      return cache.cachedAction(txKey(tx), action, ENRICH_TTL);
    },
    enrichMany: (txs: GetTx[]) => {
      const action = () => txEnricher.enrichMany(txs);
      return cache.cachedAction(txKey({ txs }), action, ENRICH_TTL);
    }
  };

  const assetEnricher = createAssetEnricher(repo, yahooApi, cachedTxEnricher);
  const cachedAssetEnricher = {
    ...assetEnricher,
    enrich: (asset: GetAsset, range: ChartRange = DEFAULT_CHART_RANGE) => {
      const action = () => assetEnricher.enrich(asset, range);
      return cache.cachedAction(assetKey({ asset, range }), action, ENRICH_TTL);
    },
    enrichMaybe: (
      asset: Optional<GetAsset>,
      range: ChartRange = DEFAULT_CHART_RANGE
    ) => {
      const action = () => assetEnricher.enrichMaybe(asset, range);
      return cache.cachedAction(assetKey({ asset, range }), action, ENRICH_TTL);
    },
    enrichMany: (
      assets: GetAsset[],
      range: ChartRange = DEFAULT_CHART_RANGE
    ) => {
      const action = () => assetEnricher.enrichMany(assets, range);
      return cache.cachedAction(
        assetKey({ assets, range }),
        action,
        ENRICH_TTL
      );
    }
  };

  const portfolioEnricher = createPortfolioEnricher(repo, cachedAssetEnricher);
  const cachedPortfolioEnricher = {
    ...portfolioEnricher,
    enrich: (
      portfolio: GetPortfolio,
      range: ChartRange = DEFAULT_CHART_RANGE
    ) => {
      const action = () => portfolioEnricher.enrich(portfolio, range);
      return cache.cachedAction(
        portfolioKey({ portfolio, range }),
        action,
        ENRICH_TTL
      );
    },
    enrichMaybe: (
      portfolio: Optional<GetPortfolio>,
      range: ChartRange = DEFAULT_CHART_RANGE
    ) => {
      const action = () => portfolioEnricher.enrichMaybe(portfolio, range);
      return cache.cachedAction(
        portfolioKey({ portfolio, range }),
        action,
        ENRICH_TTL
      );
    },
    enrichMany: (
      portfolios: GetPortfolio[],
      range: ChartRange = DEFAULT_CHART_RANGE
    ) => {
      const action = () => portfolioEnricher.enrichMany(portfolios, range);
      return cache.cachedAction(
        portfolioKey({ portfolios, range }),
        action,
        ENRICH_TTL
      );
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
