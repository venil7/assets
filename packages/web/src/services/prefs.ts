import type { Action, Prefs } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { apiFromToken } from "./api";

export const getPrefs = (): Action<Prefs> => {
  return pipe(
    apiFromToken,
    TE.chain(({ prefs }) => prefs.get())
  );
};

export const updatePrefs = (p: Prefs): Action<Prefs> => {
  return pipe(
    apiFromToken,
    TE.chain(({ prefs }) => prefs.update(p))
  );
};
