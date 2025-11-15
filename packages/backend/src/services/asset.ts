import {
  getAssetEnricher,
  getAssetsEnricher,
  getOptionalAssetsEnricher,
  PostAssetDecoder,
  type AssetId,
  type ChartRange,
  type EnrichedAsset,
  type Id,
  type Optional,
  type PortfolioId,
  type UserId,
  type YahooApi,
} from "@darkruby/assets-core";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import type { WebAction } from "@darkruby/fp-express";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import { mapWebError } from "../domain/error";
import type { Repository } from "../repository";
import { checkTickerExists } from "./yahoo";

const assetDecoder = liftTE(PostAssetDecoder);

export const getAssets =
  (repo: Repository, yahooApi: YahooApi) =>
  (
    userId: UserId,
    portfolioId: PortfolioId,
    range: ChartRange
  ): WebAction<readonly EnrichedAsset[]> => {
    const enrichAssets = getAssetsEnricher(yahooApi);
    return pipe(
      TE.Do,
      TE.bind("pref", () => repo.prefs.get(userId)),
      TE.bind("assets", () => repo.asset.getAll(portfolioId, userId)),
      TE.chain(({ assets, pref }) =>
        enrichAssets(assets, pref.base_ccy, range)
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
    return pipe(
      TE.Do,
      TE.bind("pref", () => repo.prefs.get(userId)),
      TE.bind("asset", () => repo.asset.get(assetId, portfolioId, userId)),
      TE.chain(({ asset, pref }) => enrichAsset(asset, pref.base_ccy, range)),
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
    const check = checkTickerExists(yahooApi);
    return pipe(
      TE.Do,
      TE.bind("pref", () => repo.prefs.get(userId)),
      TE.bind("asset", () => assetDecoder(payload)),
      TE.tap(({ asset }) => check(asset.ticker)),
      TE.bind("created", ({ asset }) =>
        repo.asset.create(asset, portfolioId, userId)
      ),
      TE.chain(({ created, pref }) => enrichAsset(created, pref.base_ccy)),
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
    const check = checkTickerExists(yahooApi);
    return pipe(
      TE.Do,
      TE.bind("pref", () => repo.prefs.get(userId)),
      TE.bind("asset", () => assetDecoder(payload)),
      TE.tap(({ asset }) => check(asset.ticker)),
      TE.bind("updated", ({ asset }) =>
        repo.asset.update(assetId, portfolioId, userId, asset)
      ),
      TE.chain(({ updated, pref }) => enrichAsset(updated, pref.base_ccy)),
      mapWebError
    );
  };
