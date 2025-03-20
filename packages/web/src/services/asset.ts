import type { Action, GetAsset } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { apiFromToken } from "./api";

export const getAssets = (portfolioId: number): Action<GetAsset[]> => {
  return pipe(
    apiFromToken,
    TE.chain((a) => a.getAssets(portfolioId))
  );
};

export const getAsset = (portfolioId: number, id: number): Action<GetAsset> => {
  return pipe(
    apiFromToken,
    TE.chain((a) => a.getAsset(portfolioId, id))
  );
};
