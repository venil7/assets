import { yahooApi, type YahooTickerSearchResult } from "@darkruby/assets-core";
import { type HandlerTask } from "@darkruby/fp-express";
import { Database } from "bun:sqlite";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { stringFromUrl } from "../decoders/params";
import { toWebError } from "../domain/error";

export type DatabaseCtx = {
  db: Database;
};

const api = yahooApi();

export const yahooSearch: HandlerTask<YahooTickerSearchResult, DatabaseCtx> = ({
  params: [req],
}) =>
  pipe(
    TE.Do,
    TE.bind("term", () => stringFromUrl(req.query.term)),
    TE.chain(({ term }) => api.search(term)),
    TE.mapLeft(toWebError)
  );
