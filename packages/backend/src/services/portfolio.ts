import {
  PostPortfolioDecoder,
  type ChartRange,
  type EnrichedPortfolio,
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
  getOptionalPorfolioEnricher,
  getPortfolioEnricher,
  getPortfoliosEnricher
} from "../enrichment";
import type { WebAction } from "../fp-express";
import type { Repository } from "../repository";
import type { YahooApi } from "../yahoo/client";
// import { getTxs as enrichedTxsGetter } from "./tx";

const portfolioDecoder = liftTE(PostPortfolioDecoder);

export const getPortfolio =
  (repo: Repository, yahooApi: YahooApi) =>
  (
    portfolioId: PortfolioId,
    userId: UserId,
    range: ChartRange
  ): WebAction<Optional<EnrichedPortfolio>> => {
    const enrichPortfolio = getOptionalPorfolioEnricher(yahooApi, repo);
    return pipe(
      TE.Do,
      TE.bind("portfolio", () => repo.portfolio.get(portfolioId, userId)),
      TE.chain(({ portfolio }) => enrichPortfolio(portfolio, range)),
      mapWebError
    );
  };

export const getPortfolios =
  (repo: Repository, yahooApi: YahooApi) =>
  (
    userId: UserId,
    range: ChartRange
  ): WebAction<readonly EnrichedPortfolio[]> => {
    const enrichPortfolios = getPortfoliosEnricher(yahooApi, repo);
    return pipe(
      TE.Do,
      TE.bind("portfolios", () => repo.portfolio.getAll(userId)),
      TE.chain(({ portfolios }) => enrichPortfolios(portfolios, range)),
      mapWebError
    );
  };

export const createPortfolio =
  (repo: Repository, yahooApi: YahooApi) =>
  (userId: UserId, payload: unknown): WebAction<EnrichedPortfolio> => {
    const enrichPortfolio = getPortfolioEnricher(yahooApi, repo);
    return pipe(
      TE.Do,
      TE.bind("portfolio", () => portfolioDecoder(payload)),
      TE.bind("created", ({ portfolio }) =>
        repo.portfolio.create(portfolio, userId)
      ),
      TE.chain(({ created }) => enrichPortfolio(created)),
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
    const enrichPortfolio = getPortfolioEnricher(yahooApi, repo);
    return pipe(
      TE.Do,
      TE.bind("portfolio", () => portfolioDecoder(payload)),
      TE.bind("updated", ({ portfolio }) =>
        repo.portfolio.update(portfolioId, portfolio, userId)
      ),
      TE.chain(({ updated }) => enrichPortfolio(updated)),
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
