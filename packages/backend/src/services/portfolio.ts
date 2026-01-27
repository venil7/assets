import {
  getOptionalPorfolioEnricher,
  getPortfolioEnricher,
  getPortfoliosEnricher,
  PostPortfolioDecoder,
  type ChartRange,
  type EnrichedPortfolio,
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
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import { mapWebError } from "../domain/error";
import type { Repository } from "../repository";

const portfolioDecoder = liftTE(PostPortfolioDecoder);

export const deletePortfolio =
  (repo: Repository) =>
  (portfolioId: PortfolioId, userId: UserId): WebAction<Optional<Id>> => {
    return pipe(
      repo.portfolio.delete(portfolioId, userId),
      TE.map(([_, rowsDeleted]) => (rowsDeleted ? { id: portfolioId } : null)),
      mapWebError
    );
  };

export const getPortfolio =
  (repo: Repository, yahooApi: YahooApi) =>
  (
    portfolioId: PortfolioId,
    userId: UserId,
    range: ChartRange
  ): WebAction<Optional<EnrichedPortfolio>> => {
    const enrichPortfolio = getOptionalPorfolioEnricher(yahooApi);
    const getTxs = ({ id: assetId }: GetAsset, after: Date) =>
      repo.tx.getAll(assetId, userId, after);
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
    const enrichPortfolio = getPortfoliosEnricher(yahooApi);
    const getTxs = ({ id: assetId }: GetAsset, after: Date) =>
      repo.tx.getAll(assetId, userId, after);
    return pipe(
      TE.Do,
      TE.bind("portfolios", () => repo.portfolio.getAll(userId)),
      TE.chain(({ portfolios }) => {
        const getAssets = ({ id: portfolioId }: GetPortfolio) =>
          repo.asset.getAll(portfolioId, userId);
        return enrichPortfolio(portfolios, getAssets, getTxs, range);
      }),
      mapWebError
    );
  };

export const createPortfolio =
  (repo: Repository, yahooApi: YahooApi) =>
  (userId: UserId, payload: unknown): WebAction<EnrichedPortfolio> => {
    const enrichPortfolio = getPortfolioEnricher(yahooApi);
    const getTxs = ({ id: assetId }: GetAsset, after: Date) =>
      repo.tx.getAll(assetId, userId, after);
    return pipe(
      TE.Do,
      TE.bind("pref", () => repo.prefs.get(userId)),
      TE.bind("portfolio", () => portfolioDecoder(payload)),
      TE.bind("created", ({ portfolio }) =>
        repo.portfolio.create(portfolio, userId)
      ),
      TE.chain(({ created, pref }) => {
        const getAssets = () => TE.of([]);
        return enrichPortfolio(created, getAssets, getTxs, pref.base_ccy);
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
    const getTxs = ({ id: assetId }: GetAsset, after: Date) =>
      repo.tx.getAll(assetId, userId, after);
    return pipe(
      TE.Do,
      TE.bind("pref", () => repo.prefs.get(userId)),
      TE.bind("portfolio", () => portfolioDecoder(payload)),
      TE.bind("updated", ({ portfolio }) =>
        repo.portfolio.update(portfolioId, portfolio, userId)
      ),
      TE.chain(({ updated, pref }) => {
        const getAssets = () => repo.asset.getAll(updated.id, userId);
        return enrichPortfolio(updated, getAssets, getTxs, pref.base_ccy);
      }),
      mapWebError
    );
  };
