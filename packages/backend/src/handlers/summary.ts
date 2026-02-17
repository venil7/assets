import {
  enrichSummary,
  type EnrichedPortfolio,
  type Summary
} from "@darkruby/assets-core";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import type { HandlerTask } from "../fp-express";
import type { Context } from "./context";
import { getPortfolios } from "./portfolio";

export const getSummary: HandlerTask<Summary, Context> = (ctx) =>
  pipe(
    getPortfolios(ctx),
    TE.map((ps) => enrichSummary(ps as EnrichedPortfolio[]))
  );
