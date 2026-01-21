import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import type { Ccy } from "../decoders";
import { handleError, priceForDate, rangeForDate } from "../domain";
import { type YahooApi } from "../http";
import { defined, type Action, type Optional } from "../utils/utils";

export const getToBase = (baseRate: number) => (n: number) => n / baseRate;

const maybeRangeForDate = (d: Optional<Date>) =>
  defined(d) ? rangeForDate(d) : undefined;

export const baseCcyConversionRate =
  (yahooApi: YahooApi) =>
  (
    ccy: string,
    base: Ccy,
    date: Optional<Date> = undefined /**no date means latest market rate */
  ): Action<number> => {
    if (ccy === base) return TE.of(1);
    if (ccy === "GBp" && base === "GBP") return TE.of(100);

    const term = `${base}/${ccy}`;

    return pipe(
      TE.Do,
      TE.let("date", () => date),
      TE.bind("search", () => yahooApi.search(term)),
      TE.filterOrElse(
        ({ search }) => search.quotes.length > 0,
        handleError(`${term} is not convertible`)
      ),
      TE.let("symbol", ({ search }) => search.quotes[0].symbol),
      TE.bind("chart", ({ symbol, date }) =>
        yahooApi.chart(symbol, maybeRangeForDate(date))
      ),
      TE.map(({ chart, date }) => {
        const price = priceForDate(chart, date);
        // if price in pence adjust accordingly
        if (ccy === "GBp") return price * 100;
        return price;
      })
    );
  };
