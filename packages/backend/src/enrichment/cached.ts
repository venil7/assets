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
  const assetEnricher = createAssetEnricher(repo, yahooApi);
  const portfolioEnricher = createPortfolioEnricher(repo, yahooApi);
  const summaryEnricher = createSummaryEnricher();
  return {
    tx: {
      // enrich: (tx: GetTx) => {
      //   const key = `enrich-tx-${tx.id}`;
      //   const action = () => txEnricher.enrich(tx);
      //   return cache.cachedAction(key, action, ENRICH_TTL);
      // },
      // enrichMany: (txs: GetTx[]) => {
      //   const key = `enrich-txs-${txs.map((tx) => tx.id).join("-")}`;
      //   const action = () => txEnricher.enrichMany(txs);
      //   return cache.cachedAction(key, action, ENRICH_TTL);
      // },
      ...txEnricher
    },
    asset: {
      // enrich: (asset: GetAsset, range: ChartRange = DEFAULT_CHART_RANGE) => {
      //   const key = `enrich-asset-${asset.id}-${range}`;
      //   const action = () => assetEnricher.enrich(asset, range);
      //   return cache.cachedAction(key, action, ENRICH_TTL);
      // },
      // enrichMaybe: (
      //   asset: Optional<GetAsset>,
      //   range: ChartRange = DEFAULT_CHART_RANGE
      // ) => {
      //   const key = `enrich-asset-${asset?.id}-${range}`;
      //   const action = () => assetEnricher.enrichMaybe(asset, range);
      //   return cache.cachedAction(key, action, ENRICH_TTL);
      // },
      // enrichMany: (
      //   assets: GetAsset[],
      //   range: ChartRange = DEFAULT_CHART_RANGE
      // ) => {
      //   const key = `enrich-assets-${assets.map((a) => a.id).join("-")}-${range}`;
      //   const action = () => assetEnricher.enrichMany(assets, range);
      //   return cache.cachedAction(key, action, ENRICH_TTL);
      // },
      ...assetEnricher
    },
    portfolio: { ...portfolioEnricher },
    summary: { ...summaryEnricher }
  };
};
