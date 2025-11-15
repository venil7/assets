import type {
  Action,
  GetUser,
  Id,
  PasswordChange,
  PostUser,
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { apiFromToken } from "./api";

export const getProfile = (): Action<GetUser> => {
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

export const updateProfile = (usr: PostUser): Action<GetUser> => {
  return pipe(
    apiFromToken,
    TE.chain(({ profile }) => profile.update(usr))
  );
};

export const updatePassword = (c: PasswordChange): Action<GetUser> => {
  return pipe(
    apiFromToken,
    TE.chain(({ profile }) => profile.password(c))
  );
};
