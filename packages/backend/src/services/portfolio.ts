import {
  getOptionalPorfolioEnricher,
  getPortfolioEnricher,
  getPortfoliosEnricher,
  handleError,
  PostPortfolioDecoder,
  type Action,
  type AssetId,
  type ChartRange,
  type EnrichedPortfolio,
  type EnrichedTx,
  type GetAsset,
  type GetPortfolio,
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

const portfolioDecoder = liftTE(PostPortfolioDecoder);

const getEnrichedTxs = (repo: Repository, yahooApi: YahooApi) =>
  flow(enrichedTxsGetter(repo, yahooApi), TE.mapLeft(handleError())) as (
    assetId: AssetId,
    portfolioId: PortfolioId,
    userId: UserId
  ) => Action<EnrichedTx[]>;

export const getPortfolio =
  (repo: Repository, yahooApi: YahooApi) =>
  (
    portfolioId: PortfolioId,
    userId: UserId,
    range: ChartRange
  ): WebAction<Optional<EnrichedPortfolio>> => {
    const enrichPortfolio = getOptionalPorfolioEnricher(yahooApi);
    const getTxs = ({ id: assetId }: GetAsset) =>
      getEnrichedTxs(repo, yahooApi)(assetId, portfolioId, userId);
    return pipe(
      TE.Do,
      TE.bind("portfolio", () => repo.portfolio.get(portfolioId, userId)),
      TE.chain(({ portfolio }) => {
        const getAssets = () => repo.asset.getAll(portfolio!.id, userId);
        return enrichPortfolio(portfolio, getAssets, getTxs, range);
      }),
      mapWebError
    );
  };

export const getPortfolios =
  (repo: Repository, yahooApi: YahooApi) =>
  (
    userId: UserId,
    range: ChartRange
  ): WebAction<readonly EnrichedPortfolio[]> => {
    const enrichPortfolios = getPortfoliosEnricher(yahooApi);
    const getTxs = (
      { id: assetId }: GetAsset,
      { id: portfolioId }: GetPortfolio
    ) => getEnrichedTxs(repo, yahooApi)(assetId, portfolioId, userId);
    return pipe(
      TE.Do,
      TE.bind("portfolios", () => repo.portfolio.getAll(userId)),
      TE.chain(({ portfolios }) => {
        const getAssets = ({ id: portfolioId }: GetPortfolio) =>
          repo.asset.getAll(portfolioId, userId);
        return enrichPortfolios(portfolios, getAssets, getTxs, range);
      }),
      mapWebError
    );
  };

export const createPortfolio =
  (repo: Repository, yahooApi: YahooApi) =>
  (userId: UserId, payload: unknown): WebAction<EnrichedPortfolio> => {
    const enrichPortfolio = getPortfolioEnricher(yahooApi);
    const getTxs =
      (portfolioId: PortfolioId) =>
      ({ id: assetId }: GetAsset) =>
        getEnrichedTxs(repo, yahooApi)(assetId, portfolioId, userId);
    return pipe(
      TE.Do,
      TE.bind("portfolio", () => portfolioDecoder(payload)),
      TE.bind("created", ({ portfolio }) =>
        repo.portfolio.create(portfolio, userId)
      ),
      TE.chain(({ created }) => {
        const getAssets = () => TE.of([]);
        return enrichPortfolio(created, getAssets, getTxs(created.id));
      }),
      mapWebError
    );
  };

export const updatePortfolio =
  (repo: Repository, yahooApi: YahooApi) =>
  (
    portfolioId: PortfolioId,
    userId: UserId,
    payload: unknown
  ): WebAction<EnrichedPortfolio> => {
    const enrichPortfolio = getPortfolioEnricher(yahooApi);
    const getTxs = ({ id: assetId }: GetAsset) =>
      getEnrichedTxs(repo, yahooApi)(assetId, portfolioId, userId);
    return pipe(
      TE.Do,
      TE.bind("portfolio", () => portfolioDecoder(payload)),
      TE.bind("updated", ({ portfolio }) =>
        repo.portfolio.update(portfolioId, portfolio, userId)
      ),
      TE.chain(({ updated }) => {
        const getAssets = () => repo.asset.getAll(updated.id, userId);
        return enrichPortfolio(updated, getAssets, getTxs);
      }),
      mapWebError
    );
  };

export const deletePortfolio =
  (repo: Repository) =>
  (portfolioId: PortfolioId, userId: UserId): WebAction<Optional<Id>> => {
    return pipe(
      repo.portfolio.delete(portfolioId, userId),
      TE.map(([_, rowsDeleted]) => (rowsDeleted ? { id: portfolioId } : null)),
      mapWebError
    );
  };
