import { type Fx, type YahooTickerSearchResult } from "@darkruby/assets-core";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { ccyFromUrl, optDateFromUrl, stringFromUrl } from "../decoders/params";
import { mapWebError } from "../domain/error";
import { type HandlerTask } from "../fp-express";
import type { Context } from "./context";

export const search: HandlerTask<YahooTickerSearchResult, Context> = ({
  params: [req],
  context: { yahooApi }
}) =>
  pipe(stringFromUrl(req.query.term), TE.chain(yahooApi.search), mapWebError);

export const fxRate: HandlerTask<Fx, Context> = ({
  params: [req],
  context: { yahooApi }
}) =>
  pipe(
    TE.Do,
    TE.bind("ccy", () => stringFromUrl(req.params.ccy)),
    TE.bind("base", () => ccyFromUrl(req.params.base)),
    TE.bind("date", () => optDateFromUrl(req.params.date)),
    TE.chain(({ ccy, base, date }) =>
      yahooApi.baseCcyConversionRate(ccy, base, date)
    ),
    mapWebError
  );
