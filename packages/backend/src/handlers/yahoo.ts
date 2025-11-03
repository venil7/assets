import { type YahooTickerSearchResult } from "@darkruby/assets-core";
import { type HandlerTask } from "@darkruby/fp-express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { stringFromUrl } from "../decoders/params";
import { mapWebError } from "../domain/error";
import type { Context } from "./context";

export const yahooSearch: HandlerTask<YahooTickerSearchResult, Context> = ({
  params: [req],
  context: { yahooApi },
}) =>
  pipe(stringFromUrl(req.query.term), TE.chain(yahooApi.search), mapWebError);
