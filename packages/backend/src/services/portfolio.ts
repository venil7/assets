import {
  getOptionalPorfolioEnricher,
  getPortfolioEnricher,
  getPortfoliosEnricher,
  PostPortfolioDecoder,
  type ChartRange,
  type EnrichedPortfolio,
  type GetPortfolio,
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
    const enrich = getOptionalPorfolioEnricher(yahooApi);
    return pipe(
      TE.Do,
      TE.bind("pref", () => repo.prefs.get(userId)),
      TE.bind("portfolio", () => repo.portfolio.get(portfolioId, userId)),
      TE.chain(({ portfolio, pref }) => {
        const getAssets = () => repo.asset.getAll(portfolio!.id, userId);
        return enrich(portfolio, getAssets, pref.base_ccy, range);
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
    const enrich = getPortfoliosEnricher(yahooApi);
    return pipe(
      TE.Do,
      TE.bind("pref", () => repo.prefs.get(userId)),
      TE.bind("portfolios", () => repo.portfolio.getAll(userId)),
      TE.chain(({ portfolios, pref }) => {
        const getAssets = ({ id: portfolioId }: GetPortfolio) =>
          repo.asset.getAll(portfolioId, userId);
        return enrich(portfolios, getAssets, pref.base_ccy, range);
      }),
      mapWebError
    );
  };

export const createPortfolio =
  (repo: Repository, yahooApi: YahooApi) =>
  (userId: UserId, payload: unknown): WebAction<EnrichedPortfolio> => {
    const enrich = getPortfolioEnricher(yahooApi);
    return pipe(
      TE.Do,
      TE.bind("pref", () => repo.prefs.get(userId)),
      TE.bind("portfolio", () => portfolioDecoder(payload)),
      TE.bind("created", ({ portfolio }) =>
        repo.portfolio.create(portfolio, userId)
      ),
      TE.chain(({ created, pref }) => {
        const getAssets = () => TE.of([]);
        return enrich(created, getAssets, pref.base_ccy);
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
    const enrich = getPortfolioEnricher(yahooApi);
    return pipe(
      TE.Do,
      TE.bind("pref", () => repo.prefs.get(userId)),
      TE.bind("portfolio", () => portfolioDecoder(payload)),
      TE.bind("updated", ({ portfolio }) =>
        repo.portfolio.update(portfolioId, portfolio, userId)
      ),
      TE.chain(({ updated, pref }) => {
        const getAssets = () => repo.asset.getAll(updated.id, userId);
        return enrich(updated, getAssets, pref.base_ccy);
      }),
      mapWebError
    );
  };
