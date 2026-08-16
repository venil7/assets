import type { EnrichedAsset, EnrichedPortfolio } from "@darkruby/assets-core";
import { expect, test } from "bun:test";
import { createAssetEnricher } from "../../src/enrichment/asset";
import { createPortfolioEnricher } from "../../src/enrichment/portfolio";

// calcAssetWeights / calcPortfolioWeights are exposed via the enricher
// factories and do not touch the repo/yahoo dependencies, so null stubs work
const { calcAssetWeights } = createAssetEnricher(null as never, null as never, {
  enrich: null as never,
  enrichMany: null as never
});
const { calcPortfolioWeights } = createPortfolioEnricher(null as never, {
  enrich: null as never,
  enrichMany: null as never,
  enrichMaybe: null as never,
  calcAssetWeights: null as never
});

const asset = (invested: number): EnrichedAsset =>
  ({ base: { invested } }) as unknown as EnrichedAsset;

test("calcAssetWeights is proportional to invested", () => {
  const res = calcAssetWeights([asset(100), asset(300)]);
  expect(res[0].weight).toBe(0.25);
  expect(res[1].weight).toBe(0.75);
});

test("calcAssetWeights leaves weight unset when nothing is invested", () => {
  const res = calcAssetWeights([asset(0), asset(0)]);
  expect(res[0].weight).toBeUndefined();
  expect(res[1].weight).toBeUndefined();
});

const portfolio = (invested: number): EnrichedPortfolio =>
  ({ invested }) as unknown as EnrichedPortfolio;

test("calcPortfolioWeights is proportional to invested", () => {
  const res = calcPortfolioWeights([portfolio(200), portfolio(600)]);
  expect(res[0].weight).toBe(0.25);
  expect(res[1].weight).toBe(0.75);
});

test("calcPortfolioWeights leaves weight unset when nothing is invested", () => {
  const res = calcPortfolioWeights([portfolio(0)]);
  expect(res[0].weight).toBeUndefined();
});

test("calcPortfolioWeights with a single portfolio is 1", () => {
  const res = calcPortfolioWeights([portfolio(42)]);
  expect(res[0].weight).toBe(1);
});
