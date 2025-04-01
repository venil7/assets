import type {
  Action,
  EnrichedAsset,
  Id,
  PostAsset,
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { apiFromToken } from "./api";

export const getAssets = (portfolioId: number): Action<EnrichedAsset[]> => {
  return pipe(
    apiFromToken,
    TE.chain(({ asset }) => asset.getMany(portfolioId))
  );
};

export const getAsset = (
  portfolioId: number,
  id: number
): Action<EnrichedAsset> => {
  return pipe(
    apiFromToken,
    TE.chain(({ asset }) => asset.get(portfolioId, id))
  );
};

export const deleteAsset = (portfolioId: number, id: number): Action<Id> => {
  return pipe(
    apiFromToken,
    TE.chain(({ asset }) => asset.delete(portfolioId, id))
  );
};

export const createAsset = (
  portfolioId: number,
  a: PostAsset
): Action<EnrichedAsset> => {
  return pipe(
    apiFromToken,
    TE.chain(({ asset }) => asset.create(portfolioId, a))
  );
};

export const updateAsset = (
  pid: number,
  aid: number,
  a: PostAsset
): Action<EnrichedAsset> => {
  return pipe(
    apiFromToken,
    TE.chain(({ asset }) => asset.update(pid, aid, a))
  );
};
