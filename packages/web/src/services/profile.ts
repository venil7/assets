import type { Action, Credentials, Id, Profile } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { apiFromToken } from "./api";

export const getProfile = (): Action<Profile> => {
  return pipe(
    apiFromToken,
    TE.chain(({ profile }) => profile.get())
  );
};

export const deleteProfile = (): Action<Id> => {
  return pipe(
    apiFromToken,
    TE.chain(({ profile }) => profile.delete())
  );
};

export const updateCredentials = (c: Credentials): Action<Profile> => {
  return pipe(
    apiFromToken,
    TE.chain(({ profile }) => profile.update(c))
  );
};
