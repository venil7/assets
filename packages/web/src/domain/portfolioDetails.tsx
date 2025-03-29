import type {
  EnrichedAsset,
  EnrichedPortfolio,
  Identity,
} from "@darkruby/assets-core";

export type PortfolioDetails = Identity<
  EnrichedPortfolio & { assets: EnrichedAsset[] }
>;
