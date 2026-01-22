import {
  getAssetEnricher,
  getAssetsEnricher,
  getOptionalAssetsEnricher,
  PostAssetDecoder,
  type AssetId,
  type ChartRange,
  type EnrichedAsset,
  type GetAsset,
  type Id,
  type Optional,
  type PortfolioId,
  type UserId,
  type YahooApi
} from "@darkruby/assets-core";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import type { WebAction } from "@darkruby/fp-express";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import { mapWebError } from "../domain/error";
import type { Repository } from "../repository";

const assetDecoder = liftTE(PostAssetDecoder);

export const getAssets =
  (repo: Repository, yahooApi: YahooApi) =>
  (
    userId: UserId,
    portfolioId: PortfolioId,
    range: ChartRange
  ): WebAction<readonly EnrichedAsset[]> => {
    const enrichAssets = getAssetsEnricher(yahooApi);
    const getTxs = ({ id: assetId }: GetAsset, after: Date) =>
      repo.tx.getAll(assetId, userId, after);

    return pipe(
      TE.Do,
      TE.bind("pref", () => repo.prefs.get(userId)),
      TE.bind("assets", () => repo.asset.getAll(portfolioId, userId)),
      TE.chain(({ assets, pref }) =>
        enrichAssets(assets, getTxs, pref.base_ccy, range)
      ),
      mapWebError
    );
  };

export const getAsset =
  (repo: Repository, yahooApi: YahooApi) =>
  (
    assetId: AssetId,
    portfolioId: PortfolioId,
    userId: UserId,
    range: ChartRange
  ): WebAction<Optional<EnrichedAsset>> => {
    const enrichAsset = getOptionalAssetsEnricher(yahooApi);
    const getTxs = (after: Date) => repo.tx.getAll(assetId, userId, after);
    return pipe(
      TE.Do,
      TE.bind("pref", () => repo.prefs.get(userId)),
      TE.bind("asset", () => repo.asset.get(assetId, portfolioId, userId)),
      TE.chain(({ asset, pref }) =>
        enrichAsset(asset, getTxs, pref.base_ccy, range)
      ),
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
    const enrichAsset = getAssetEnricher(yahooApi);
    const getTxs = (assetId: AssetId) => (after: Date) =>
      repo.tx.getAll(assetId, userId, after);
    return pipe(
      TE.Do,
      TE.bind("pref", () => repo.prefs.get(userId)),
      TE.bind("asset", () => assetDecoder(payload)),
      TE.tap(({ asset }) => yahooApi.checkTickerExists(asset.ticker)),
      TE.bind("created", ({ asset }) =>
        repo.asset.create(asset, portfolioId, userId)
      ),
      TE.chain(({ created, pref }) =>
        enrichAsset(created, getTxs(created.id), pref.base_ccy)
      ),
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
    const enrichAsset = getAssetEnricher(yahooApi);
    const getTxs = (after: Date) => repo.tx.getAll(assetId, userId, after);
    return pipe(
      TE.Do,
      TE.bind("pref", () => repo.prefs.get(userId)),
      TE.bind("asset", () => assetDecoder(payload)),
      TE.tap(({ asset }) => yahooApi.checkTickerExists(asset.ticker)),
      TE.bind("updated", ({ asset }) =>
        repo.asset.update(assetId, portfolioId, userId, asset)
      ),
      TE.chain(({ updated, pref }) =>
        enrichAsset(updated, getTxs, pref.base_ccy)
      ),
      mapWebError
    );
  };
