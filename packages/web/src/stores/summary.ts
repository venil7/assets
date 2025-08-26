import type {
  ActionResult,
  Identity,
  Nullable,
  Summary,
} from "@darkruby/assets-core";
import { signal } from "@preact/signals-react";

import type { ChartRange } from "@darkruby/assets-core/src/decoders/yahoo/meta";
import { getSummary } from "../services/summary";
import { type StoreBase, createStoreBase } from "./base";

export type SummaryStore = Identity<
  StoreBase<Nullable<Summary>> & {
    load: (range?: ChartRange) => ActionResult<Nullable<Summary>>;
  }
>;

export const createSummaryStore = (): SummaryStore => {
  const data = signal<Nullable<Summary>>(null);
  const storeBase = createStoreBase(data);

  return {
    ...storeBase,
    load: (range?: ChartRange) => storeBase.run(getSummary(range)),
  };
};
