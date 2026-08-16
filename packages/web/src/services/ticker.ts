import type {
  Action,
  Ccy,
  ChartDataPoint,
  Fx,
  Optional,
  TickerSearchResult,
  UnixDate
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { apiFromToken } from "./api";

const lookup = (term: string): Action<TickerSearchResult> => {
  return pipe(
    apiFromToken,
    TE.chain(({ yahoo }) => yahoo.lookupTicker(term))
  );
};

const fx = (
  base: Ccy,
  ccy: string,
  date: Optional<Date | UnixDate>
): Action<Fx> => {
  return pipe(
    apiFromToken,
    TE.chain(({ yahoo }) => yahoo.fxRate(base, ccy, date))
  );
};

const quote = (
  ticker: string,
  date: Optional<Date | UnixDate>
): Action<ChartDataPoint> => {
  return pipe(
    apiFromToken,
    TE.chain(({ yahoo }) => yahoo.quote(ticker, date))
  );
};

export const ticker = {
  lookup,
  fx,
  quote
};
