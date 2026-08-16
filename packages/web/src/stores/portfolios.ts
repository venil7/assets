import type {
  ActionResult,
  EnrichedPortfolio,
  Identity,
  PostPortfolio
} from "@darkruby/assets-core";
import type { ChartRange } from "@darkruby/assets-core/src/decoders/yahoo/meta";
import { signal } from "@preact/signals-react";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { portfolios } from "../services/portfolios";
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
    load: (range?: ChartRange) => storeBase.run(portfolios.getMany(range)),
    create: (p: PostPortfolio) =>
      storeBase.run(
        pipe(
          portfolios.create(p),
          TE.chain(() => portfolios.getMany())
        )
      ),
    update: (pid: number, p: PostPortfolio) =>
      storeBase.run(
        pipe(
          portfolios.update(pid, p),
          TE.chain(() => portfolios.getMany())
        )
      ),
    delete: (pid: number) =>
      storeBase.run(
        pipe(
          portfolios.delete(pid),
          TE.chain(() => portfolios.getMany())
        )
      )
  };
};
