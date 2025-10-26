import type { Action, Preferences } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { apiFromToken } from "./api";

export const getPreferences = (): Action<Preferences> => {
  return pipe(
    apiFromToken,
    TE.chain(({ preferences }) => preferences.get())
  );
};

export const updateCredentials = (p: Preferences): Action<Preferences> => {
  return pipe(
    apiFromToken,
    TE.chain(({ preferences }) => preferences.update(p))
  );
};
