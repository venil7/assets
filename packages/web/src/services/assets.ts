import type {
  Action,
  EnrichedAsset,
  Id,
  PostAsset,
} from "@darkruby/assets-core";
import type { ChartRange } from "@darkruby/assets-core/src/decoders/yahoo/meta";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { apiFromToken } from "./api";

export const getAssets = (pid: number): Action<EnrichedAsset[]> => {
  return pipe(
    apiFromToken,
    TE.chain(({ asset }) => asset.getMany(pid))
  );
};

export const getAsset = (
  pid: number,
  aid: number,
  range?: ChartRange
): Action<EnrichedAsset> => {
  return pipe(
    apiFromToken,
    TE.chain(({ asset }) => asset.get(pid, aid, range))
  );
};

export const deleteAsset = (pid: number, aid: number): Action<Id> => {
  return pipe(
    apiFromToken,
    TE.chain(({ asset }) => asset.delete(pid, aid))
  );
};

export const createAsset = (
  pid: number,
  a: PostAsset
): Action<EnrichedAsset> => {
  return pipe(
    apiFromToken,
    TE.chain(({ asset }) => asset.create(pid, a))
  );
};

export const updateAsset = (
  pid: number,
  aid: number,
  a: PostAsset
): Action<EnrichedAsset> => {
  return pipe(
    apiFromToken,
    TE.chain(({ asset }) => asset.update(aid, pid, a))
  );
};
