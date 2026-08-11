import type { Action, Prefs } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { apiFromToken } from "./api";

const get = (): Action<Prefs> => {
  return pipe(
    apiFromToken,
    TE.chain(({ prefs }) => prefs.get())
  );
};

const update = (p: Prefs): Action<Prefs> => {
  return pipe(
    apiFromToken,
    TE.chain(({ prefs }) => prefs.update(p))
  );
};

export const prefs = {
  get,
  update
};
