import type {
  Action,
  Ccy,
  Fx,
  Optional,
  TickerSearchResult,
  UnixDate
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { apiFromToken } from "./api";

export const lookupTicker = (term: string): Action<TickerSearchResult> => {
  return pipe(
    apiFromToken,
    TE.chain(({ yahoo }) => yahoo.lookupTicker(term))
  );
};

export const fxRate = (
  base: Ccy,
  ccy: string,
  date: Optional<Date | UnixDate>
): Action<Fx> => {
  return pipe(
    apiFromToken,
    TE.chain(({ yahoo }) => yahoo.fxRate(base, ccy, date))
  );
};
