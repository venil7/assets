import type {
  ActionResult,
  AssetId,
  EnrichedAsset,
  Identity,
  PortfolioId,
  PostAsset
} from "@darkruby/assets-core";
import type { ChartRange } from "@darkruby/assets-core/src/decoders/yahoo/meta";
import { signal } from "@preact/signals-react";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import {
  createAsset,
  deleteAsset,
  getAssets,
  moveAsset,
  updateAsset
} from "../services/assets";
import { type StoreBase, createStoreBase } from "./base";

export type AssetsStore = Identity<
  StoreBase<EnrichedAsset[]> & {
    load: (
      pid: PortfolioId,
      range?: ChartRange
    ) => ActionResult<EnrichedAsset[]>;
    create: (pid: PortfolioId, a: PostAsset) => ActionResult<EnrichedAsset[]>;
    update: (
      pid: PortfolioId,
      aid: AssetId,
      a: PostAsset
    ) => ActionResult<EnrichedAsset[]>;
    move: (
      pid: PortfolioId,
      aid: AssetId,
      npid: PortfolioId
    ) => ActionResult<EnrichedAsset[]>;
    delete: (pid: PortfolioId, aid: AssetId) => ActionResult<EnrichedAsset[]>;
  }
>;

export const createAssetsStore = (): AssetsStore => {
  const data = signal<EnrichedAsset[]>([]);
  const storeBase = createStoreBase(data);

  return {
    ...storeBase,
    load: (pid: PortfolioId, range?: ChartRange) =>
      storeBase.run(getAssets(pid, range)),
    create: (pid: PortfolioId, a: PostAsset) =>
      storeBase.run(
        pipe(
          createAsset(pid, a),
          TE.chain(() => getAssets(pid))
        )
      ),
    update: (pid: PortfolioId, aid: AssetId, a: PostAsset) =>
      storeBase.run(
        pipe(
          updateAsset(pid, aid, a),
          TE.chain(() => getAssets(pid))
        )
      ),
    move: (pid: PortfolioId, aid: AssetId, npid: PortfolioId) =>
      storeBase.run(
        pipe(
          moveAsset(pid, aid, npid),
          TE.chain(() => getAssets(pid))
        )
      ),
    delete: (pid: PortfolioId, aid: AssetId) =>
      storeBase.run(
        pipe(
          deleteAsset(pid, aid),
          TE.chain(() => getAssets(pid))
        )
      )
  };
};
