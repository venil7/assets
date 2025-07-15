import type {
  ActionResult,
  EnrichedPortfolio,
  Identity,
  Nullable,
  PostPortfolio,
} from "@darkruby/assets-core";
import { signal } from "@preact/signals-react";
import { pipe } from "fp-ts/lib/function";

import type { ChartRange } from "@darkruby/assets-core/src/decoders/yahoo/meta";
import * as TE from "fp-ts/lib/TaskEither";
import {
  createPortfolio,
  deletePortfolio,
  getPortfolio,
  updatePortfolio,
} from "../services/portfolios";
import { type StoreBase, createStoreBase } from "./base";

export type PortfolioStore = Identity<
  StoreBase<Nullable<EnrichedPortfolio>> & {
    load: (
      portfolioId: number,
      range?: ChartRange
    ) => ActionResult<Nullable<EnrichedPortfolio>>;
    update: (
      pid: number,
      p: PostPortfolio
    ) => ActionResult<Nullable<EnrichedPortfolio>>;
    create: (a: PostPortfolio) => ActionResult<Nullable<EnrichedPortfolio>>;
    delete: (pid: number) => ActionResult<Nullable<EnrichedPortfolio>>;
  }
>;

export const createPortfolioStore = (): PortfolioStore => {
  const data = signal<Nullable<EnrichedPortfolio>>(null);
  const storeBase = createStoreBase(data);

  return {
    ...storeBase,
    load: (portfolioId: number, range?: ChartRange) =>
      storeBase.run(getPortfolio(portfolioId, range)),
    update: (pid: number, p: PostPortfolio) =>
      storeBase.run(updatePortfolio(pid, p)),
    create: (p: PostPortfolio) => storeBase.run(createPortfolio(p)),

    delete: (pid: number) =>
      storeBase.run(
        pipe(
          deletePortfolio(pid),
          TE.map(() => null)
        )
      ),
  };
};
