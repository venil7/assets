import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import type { Ccy } from "../decoders";
import { generalError } from "../domain";
import { yahooApi } from "../http";
import type { Action } from "../utils/utils";

export const baseCcyConversionRate = (
  ccy: string,
  base: Ccy
): Action<number> => {
  if (ccy === base) return TE.of(1);
  const term = `${base}/${ccy}`;
  return pipe(
    yahooApi.search(term), //eg gbpusd
    TE.map((a) => A.head(a.quotes)),
    TE.chain((a) => {
      if (O.isSome(a)) return TE.of(a.value.symbol);
      return TE.left(generalError(`${term} is not convertible`));
    }),
    TE.chain(yahooApi.chart),
    TE.map(({ meta }) => meta.regularMarketPrice),
    TE.map((price) => {
      // if price in pence adjust accordingly
      if (ccy === "GBp") return price * 100;
      return price;
    })
  );
};
