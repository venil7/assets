import type { Action, Profile } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { apiFromToken } from "./api";

export const getProfile = (): Action<Profile> => {
  return pipe(
    apiFromToken,
    TE.chain(({ profile }) => profile.get())
  );
};
