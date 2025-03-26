import { yahooApi, type YahooTickerSearchResult } from "@darkruby/assets-core";
import { type HandlerTask } from "@darkruby/fp-express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { stringFromUrl } from "../decoders/params";
import { toWebError } from "../domain/error";
import type { Context } from "./context";

export const yahooSearch: HandlerTask<YahooTickerSearchResult, Context> = ({
  params: [req],
}) =>
  pipe(
    TE.Do,
    TE.bind("term", () => stringFromUrl(req.query.term)),
    TE.chain(({ term }) => yahooApi.search(term)),
    TE.mapLeft(toWebError)
  );
