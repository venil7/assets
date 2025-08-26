import type {
  ActionResult,
  EnrichedPortfolio,
  Identity,
  PostPortfolio,
} from "@darkruby/assets-core";
import type { ChartRange } from "@darkruby/assets-core/src/decoders/yahoo/meta";
import { signal } from "@preact/signals-react";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import {
  createPortfolio,
  deletePortfolio,
  getPortfolios,
  updatePortfolio,
} from "../services/portfolios";
import { type StoreBase, createStoreBase } from "./base";

export type PortfoliosStore = Identity<
  StoreBase<EnrichedPortfolio[]> & {
    load: (range?: ChartRange) => ActionResult<EnrichedPortfolio[]>;
    create: (p: PostPortfolio) => ActionResult<EnrichedPortfolio[]>;
    update: (
      pid: number,
      p: PostPortfolio
    ) => ActionResult<EnrichedPortfolio[]>;
    delete: (pid: number) => ActionResult<EnrichedPortfolio[]>;
  }
>;

export const createPortfoliosStore = (): PortfoliosStore => {
  const data = signal<EnrichedPortfolio[]>([]);
  const storeBase = createStoreBase(data, () => []);

  return {
    ...storeBase,
    load: (range?: ChartRange) => storeBase.run(getPortfolios(range)),
    create: (p: PostPortfolio) =>
      storeBase.run(
        pipe(
          createPortfolio(p),
          TE.chain(() => getPortfolios())
        )
      ),
    update: (pid: number, p: PostPortfolio) =>
      storeBase.run(
        pipe(
          updatePortfolio(pid, p),
          TE.chain(() => getPortfolios())
        )
      ),
    delete: (pid: number) =>
      storeBase.run(
        pipe(
          deletePortfolio(pid),
          TE.chain(() => getPortfolios())
        )
      ),
  };
};
