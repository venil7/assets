import type { Action, EnrichedAsset } from "@darkruby/assets-core";
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
