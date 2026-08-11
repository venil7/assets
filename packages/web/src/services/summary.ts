import { type Action, type EnrichedSummary } from "@darkruby/assets-core";
import type { ChartRange } from "@darkruby/assets-core/src/decoders/yahoo/meta";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { apiFromToken } from "./api";

const get = (range?: ChartRange): Action<EnrichedSummary> => {
  return pipe(
    apiFromToken,
    TE.chain(({ summary }) => summary.get(range))
  );
};

export const summary = {
  get
};
