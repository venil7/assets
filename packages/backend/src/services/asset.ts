import {
  getAssetEnricher,
  getAssetsEnricher,
  getOptionalAssetEnricher,
  handleError,
  PostAssetDecoder,
  type Action,
  type AssetId,
  type ChartRange,
  type EnrichedAsset,
  type EnrichedTx,
  type GetAsset,
  type Id,
  type Optional,
  type PortfolioId,
  type UserId,
  type YahooApi
} from "@darkruby/assets-core";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import type { WebAction } from "@darkruby/fp-express";
import { flow, pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import { mapWebError } from "../domain/error";
import type { Repository } from "../repository";
import { getTxs as enrichedTxsGetter } from "./tx";

const assetDecoder = liftTE(PostAssetDecoder);

const getEnrichedTxs = (repo: Repository, yahooApi: YahooApi) =>
  flow(enrichedTxsGetter(repo, yahooApi), TE.mapLeft(handleError())) as (
    assetId: AssetId,
    portfolioId: PortfolioId,
    userId: UserId
  ) => Action<EnrichedTx[]>;

export const getAsset =
  (repo: Repository, yahooApi: YahooApi) =>
  (
    assetId: AssetId,
    portfolioId: PortfolioId,
    userId: UserId,
    range: ChartRange
  ): WebAction<Optional<EnrichedAsset>> => {
    const enrichAsset = getOptionalAssetEnricher(yahooApi);
    const getTxs = () =>
      getEnrichedTxs(repo, yahooApi)(assetId, portfolioId, userId);
    return pipe(
      TE.Do,
      TE.bind("asset", () => repo.asset.get(assetId, portfolioId, userId)),
      TE.chain(({ asset }) => enrichAsset(asset, getTxs, range)),
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
    const enrichAssets = getAssetsEnricher(yahooApi);
    const getTxs = (asset: GetAsset) =>
      getEnrichedTxs(repo, yahooApi)(asset.id, portfolioId, userId);

    return pipe(
      TE.Do,
      TE.bind("assets", () => repo.asset.getAll(portfolioId, userId)),
      TE.chain(({ assets }) => enrichAssets(assets, getTxs, range)),
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
    const getTxs = (assetId: AssetId) => () =>
      getEnrichedTxs(repo, yahooApi)(assetId, portfolioId, userId);
    return pipe(
      TE.Do,
      TE.bind("asset", () => assetDecoder(payload)),
      TE.tap(({ asset }) => yahooApi.checkTickerExists(asset.ticker)),
      TE.bind("created", ({ asset }) =>
        repo.asset.create(asset, portfolioId, userId)
      ),
      TE.chain(({ created }) => enrichAsset(created, getTxs(created.id))),
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
    const getTxs = () =>
      getEnrichedTxs(repo, yahooApi)(assetId, portfolioId, userId);
    return pipe(
      TE.Do,
      TE.bind("asset", () => assetDecoder(payload)),
      TE.tap(({ asset }) => yahooApi.checkTickerExists(asset.ticker)),
      TE.bind("updated", ({ asset }) =>
        repo.asset.update(assetId, portfolioId, userId, asset)
      ),
      TE.chain(({ updated }) => enrichAsset(updated, getTxs)),
      mapWebError
    );
  };
