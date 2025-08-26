import { type Action, type Summary } from "@darkruby/assets-core";
import type { ChartRange } from "@darkruby/assets-core/src/decoders/yahoo/meta";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { apiFromToken } from "./api";

export const getSummary = (range?: ChartRange): Action<Summary> => {
  return pipe(
    apiFromToken,
    TE.chain(({ summary }) => summary.get(range))
  );
};
