import {
  PostAssetDecoder,
  type AssetId,
  type ChartRange,
  type EnrichedAsset,
  type Id,
  type Optional,
  type PortfolioId,
  type UserId
} from "@darkruby/assets-core";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import { mapWebError } from "../domain/error";
import {
  getAssetEnricher,
  getAssetsEnricher,
  getOptionalAssetEnricher
} from "../enrichment";
import type { WebAction } from "../fp-express";
import type { Repository } from "../repository";
import type { YahooApi } from "../yahoo/client";

const assetDecoder = liftTE(PostAssetDecoder);

export const getAsset =
  (repo: Repository, yahooApi: YahooApi) =>
  (
    assetId: AssetId,
    portfolioId: PortfolioId,
    userId: UserId,
    range: ChartRange
  ): WebAction<Optional<EnrichedAsset>> => {
    const enrichAsset = getOptionalAssetEnricher(repo, yahooApi);
    return pipe(
      TE.Do,
      TE.bind("asset", () => repo.asset.get(assetId, portfolioId, userId)),
      TE.chain(({ asset }) => enrichAsset(asset, range)),
      mapWebError
    );
  };

export const getAssets =
  (repo: Repository, yahooApi: YahooApi) =>
  (
    userId: UserId,
    portfolioId: PortfolioId,
    range: ChartRange
  ): WebAction<readonly EnrichedAsset[]> => {
    const enrichAssets = getAssetsEnricher(repo, yahooApi);
    return pipe(
      TE.Do,
      TE.bind("assets", () => repo.asset.getAll(portfolioId, userId)),
      TE.chain(({ assets }) => enrichAssets(assets, range)),
      mapWebError
    );
  };

export const deleteAsset =
  (repo: Repository) =>
  (
    assetId: AssetId,
    portfolioId: PortfolioId,
    userId: UserId
  ): WebAction<Optional<Id>> => {
    return pipe(
      repo.asset.delete(assetId, portfolioId, userId),
      TE.map(([_, rowsDeleted]) => (rowsDeleted ? { id: assetId } : null)),
      mapWebError
    );
  };

export const createAsset =
  (repo: Repository, yahooApi: YahooApi) =>
  (
    portfolioId: PortfolioId,
    userId: UserId,
    payload: unknown
  ): WebAction<EnrichedAsset> => {
    const enrichAsset = getAssetEnricher(repo, yahooApi);
    return pipe(
      TE.Do,
      TE.bind("asset", () => assetDecoder(payload)),
      TE.tap(({ asset }) => yahooApi.checkTickerExists(asset.ticker)),
      TE.bind("created", ({ asset }) =>
        repo.asset.create(asset, portfolioId, userId)
      ),
      TE.chain(({ created }) => enrichAsset(created)),
      mapWebError
    );
  };

export const updateAsset =
  (repo: Repository, yahooApi: YahooApi) =>
  (
    assetId: AssetId,
    portfolioId: PortfolioId,
    userId: UserId,
    payload: unknown
  ): WebAction<EnrichedAsset> => {
    const enrichAsset = getAssetEnricher(repo, yahooApi);
    return pipe(
      TE.Do,
      TE.bind("asset", () => assetDecoder(payload)),
      TE.tap(({ asset }) => yahooApi.checkTickerExists(asset.ticker)),
      TE.bind("updated", ({ asset }) =>
        repo.asset.update(assetId, portfolioId, userId, asset)
      ),
      TE.chain(({ updated }) => enrichAsset(updated)),
      mapWebError
    );
  };

export const moveAsset =
  (repo: Repository) =>
  (
    assetId: AssetId,
    portfolioId: PortfolioId,
    userId: UserId,
    newPortfolioId: PortfolioId
  ): WebAction<Optional<Id>> => {
    return pipe(
      repo.asset.move(assetId, portfolioId, userId, newPortfolioId),
      TE.map(([_, rowsDeleted]) => (rowsDeleted ? { id: assetId } : null)),
      mapWebError
    );
  };
