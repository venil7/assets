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
import { type PortfolioEnricher } from "../enrichment";
import type { WebAction } from "../fp-express";
import type { Repository } from "../repository";

const portfolioDecoder = liftTE(PostPortfolioDecoder);

export const getPortfolio =
  (repo: Repository, { enrichMaybe }: PortfolioEnricher) =>
  (
    portfolioId: PortfolioId,
    userId: UserId,
    range: ChartRange
  ): WebAction<Optional<EnrichedPortfolio>> => {
    return pipe(
      TE.Do,
      TE.bind("portfolio", () => repo.portfolio.get(portfolioId, userId)),
      TE.chain(({ portfolio }) => enrichMaybe(portfolio, range)),
      mapWebError
    );
  };

export const getPortfolios =
  (repo: Repository, { enrichMany }: PortfolioEnricher) =>
  (
    userId: UserId,
    range: ChartRange
  ): WebAction<readonly EnrichedPortfolio[]> => {
    return pipe(
      TE.Do,
      TE.bind("portfolios", () => repo.portfolio.getAll(userId)),
      TE.chain(({ portfolios }) => enrichMany(portfolios, range)),
      mapWebError
    );
  };

export const createPortfolio =
  (repo: Repository, { enrich }: PortfolioEnricher) =>
  (userId: UserId, payload: unknown): WebAction<EnrichedPortfolio> => {
    return pipe(
      TE.Do,
      TE.bind("portfolio", () => portfolioDecoder(payload)),
      TE.bind("created", ({ portfolio }) =>
        repo.portfolio.create(portfolio, userId)
      ),
      TE.chain(({ created }) => enrich(created)),
      mapWebError
    );
  };

export const updatePortfolio =
  (repo: Repository, { enrich }: PortfolioEnricher) =>
  (
    portfolioId: PortfolioId,
    userId: UserId,
    payload: unknown
  ): WebAction<EnrichedPortfolio> => {
    return pipe(
      TE.Do,
      TE.bind("portfolio", () => portfolioDecoder(payload)),
      TE.bind("updated", ({ portfolio }) =>
        repo.portfolio.update(portfolioId, portfolio, userId)
      ),
      TE.chain(({ updated }) => enrich(updated)),
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
