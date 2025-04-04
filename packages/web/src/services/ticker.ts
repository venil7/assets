import type { Action, TickerSearchResult } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { apiFromToken } from "./api";

export const lookupTicker = (term: string): Action<TickerSearchResult> => {
  return pipe(
    apiFromToken,
    TE.chain(({ yahoo }) => yahoo.lookupTicker(term))
  );
};
