import type {
  ActionResult,
  Identity,
  Nullable,
  PostAsset,
  PostPortfolio,
} from "@darkruby/assets-core";
import { signal } from "@preact/signals-react";
import type { PortfolioDetails } from "../domain/portfolioDetails";
import {
  createPdAsset,
  deletePdAsset,
  getPortfolioDetails,
  updatePdAsset,
  updatePdPortfolio,
} from "../services/portfolioDetails";
import { type StoreBase, createStoreBase } from "./base";

export type PortfolioDetailsStore = Identity<
  StoreBase<Nullable<PortfolioDetails>> & {
    load: (
      id: number,
      force?: boolean
    ) => ActionResult<Nullable<PortfolioDetails>>;
    update: (
      portfolioId: number,
      p: PostPortfolio
    ) => ActionResult<Nullable<PortfolioDetails>>;
    addAsset: (
      portfolioId: number,
      a: PostAsset
    ) => ActionResult<Nullable<PortfolioDetails>>;
    updateAsset: (
      portfolioId: number,
      assetId: number,
      a: PostAsset
    ) => ActionResult<Nullable<PortfolioDetails>>;
    deleteAsset: (
      portfolioId: number,
      assetId: number
    ) => ActionResult<Nullable<PortfolioDetails>>;
  }
>;

export const createPortfolioDetailsStore = (): PortfolioDetailsStore => {
  const data = signal<Nullable<PortfolioDetails>>(null);
  const storeBase = createStoreBase(data);

  return {
    ...storeBase,
    load: (id, force = true) => storeBase.run(getPortfolioDetails(id), force),
    update: (portfolioId: number, p: PostPortfolio) =>
      storeBase.run(updatePdPortfolio(portfolioId, p), true),
    addAsset: (portfolioId: number, asset: PostAsset) =>
      storeBase.run(createPdAsset(portfolioId, asset), true),
    updateAsset: (portfolioId: number, assetId: number, asset: PostAsset) =>
      storeBase.run(updatePdAsset(portfolioId, assetId, asset), true),
    deleteAsset: (portfolioId: number, assetId: number) =>
      storeBase.run(deletePdAsset(portfolioId, assetId), true),
  };
};
