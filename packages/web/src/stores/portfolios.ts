import type {
  ActionResult,
  EnrichedPortfolio,
  Identity,
  PostPortfolio,
} from "@darkruby/assets-core";
import { signal } from "@preact/signals-react";
import {
  createPortfolio,
  deletePortfolio,
  getPortfolios,
  updatePortfolio,
} from "../services/portfolios";
import { type StoreBase, createStoreBase } from "./base";

export type PortfoliosStore = Identity<
  StoreBase<EnrichedPortfolio[]> & {
    load: (force?: boolean) => ActionResult<EnrichedPortfolio[]>;
    create: (p: PostPortfolio) => ActionResult<EnrichedPortfolio[]>;
    update: (
      portfolioId: number,
      p: PostPortfolio
    ) => ActionResult<EnrichedPortfolio[]>;
    delete: (portfolioId: number) => ActionResult<EnrichedPortfolio[]>;
  }
>;

export const createPortfoliosStore = (): PortfoliosStore => {
  const data = signal<EnrichedPortfolio[]>([]);
  const storeBase = createStoreBase(data, (t) => !!t.length);

  return {
    ...storeBase,
    load: (force = false) => storeBase.run(getPortfolios(), force),
    create: (p: PostPortfolio) => storeBase.run(createPortfolio(p), true),
    update: (portfolioId: number, p: PostPortfolio) =>
      storeBase.run(updatePortfolio(portfolioId, p), true),
    delete: (portfolioId: number) =>
      storeBase.run(deletePortfolio(portfolioId), true),
  };
};
