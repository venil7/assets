import {
  byAssetChangePct,
  type Action,
  type AssetId,
  type EnrichedAsset,
  type Id,
  type PortfolioId,
  type PostAsset
} from "@darkruby/assets-core";
import type { ChartRange } from "@darkruby/assets-core/src/decoders/yahoo/meta";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { apiFromToken } from "./api";

export const getAssets = (
  pid: PortfolioId,
  range?: ChartRange
): Action<EnrichedAsset[]> => {
  return pipe(
    apiFromToken,
    TE.chain(({ asset }) => asset.getMany(pid, range)),
    TE.map(A.sort(byAssetChangePct))
  );
};

export const getAsset = (
  pid: PortfolioId,
  aid: AssetId,
  range?: ChartRange
): Action<EnrichedAsset> => {
  return pipe(
    apiFromToken,
    TE.chain(({ asset }) => asset.get(pid, aid, range))
  );
};

export const deleteAsset = (pid: PortfolioId, aid: AssetId): Action<Id> => {
  return pipe(
    apiFromToken,
    TE.chain(({ asset }) => asset.delete(pid, aid))
  );
};

export const createAsset = (
  pid: PortfolioId,
  a: PostAsset
): Action<EnrichedAsset> => {
  return pipe(
    apiFromToken,
    TE.chain(({ asset }) => asset.create(pid, a))
  );
};

export const updateAsset = (
  pid: PortfolioId,
  aid: AssetId,
  a: PostAsset
): Action<EnrichedAsset> => {
  return pipe(
    apiFromToken,
    TE.chain(({ asset }) => asset.update(aid, pid, a))
  );
};

export const moveAsset = (
  pid: PortfolioId,
  aid: AssetId,
  npid: PortfolioId
): Action<Id> => {
  return pipe(
    apiFromToken,
    TE.chain(({ asset }) => asset.move(pid, aid, npid))
  );
};
