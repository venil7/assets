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
import { type AssetEnricher } from "../enrichment";
import type { WebAction } from "../fp-express";
import type { Repository } from "../repository";
import type { YahooApi } from "../yahoo/client";

const assetDecoder = liftTE(PostAssetDecoder);

export const getAsset =
  (repo: Repository, { enrichMaybe }: AssetEnricher) =>
  (
    assetId: AssetId,
    portfolioId: PortfolioId,
    userId: UserId,
    range: ChartRange
  ): WebAction<Optional<EnrichedAsset>> => {
    return pipe(
      TE.Do,
      TE.bind("asset", () => repo.asset.get(assetId, portfolioId, userId)),
      TE.chain(({ asset }) => enrichMaybe(asset, range)),
      mapWebError
    );
  };

export const getAssets =
  (repo: Repository, { enrichMany }: AssetEnricher) =>
  (
    userId: UserId,
    portfolioId: PortfolioId,
    range: ChartRange
  ): WebAction<readonly EnrichedAsset[]> => {
    return pipe(
      TE.Do,
      TE.bind("assets", () => repo.asset.getAll(portfolioId, userId)),
      TE.chain(({ assets }) => enrichMany(assets, range)),
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
  (repo: Repository, yahooApi: YahooApi, { enrich }: AssetEnricher) =>
  (
    portfolioId: PortfolioId,
    userId: UserId,
    payload: unknown
  ): WebAction<EnrichedAsset> => {
    return pipe(
      TE.Do,
      TE.bind("asset", () => assetDecoder(payload)),
      TE.tap(({ asset }) => yahooApi.checkTickerExists(asset.ticker)),
      TE.bind("created", ({ asset }) =>
        repo.asset.create(asset, portfolioId, userId)
      ),
      TE.chain(({ created }) => enrich(created)),
      mapWebError
    );
  };

export const updateAsset =
  (repo: Repository, yahooApi: YahooApi, { enrich }: AssetEnricher) =>
  (
    assetId: AssetId,
    portfolioId: PortfolioId,
    userId: UserId,
    payload: unknown
  ): WebAction<EnrichedAsset> => {
    return pipe(
      TE.Do,
      TE.bind("asset", () => assetDecoder(payload)),
      TE.tap(({ asset }) => yahooApi.checkTickerExists(asset.ticker)),
      TE.bind("updated", ({ asset }) =>
        repo.asset.update(assetId, portfolioId, userId, asset)
      ),
      TE.chain(({ updated }) => enrich(updated)),
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
