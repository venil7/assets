import type {
  Action,
  Credentials,
  Id,
  Profile,
  UserId,
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { apiFromToken } from "./api";

export const getUsers = (): Action<Profile[]> => {
  return pipe(
    apiFromToken,
    TE.chain(({ user }) => user.getMany())
  );
};

export const getUser = (uid: UserId): Action<Profile> => {
  return pipe(
    apiFromToken,
    TE.chain(({ user }) => user.get(uid))
  );
};

export const createUser = (creds: Credentials): Action<Profile> => {
  return pipe(
    apiFromToken,
    TE.chain(({ user }) => user.create(creds))
  );
};

export const updateUser = (
  uid: UserId,
  creds: Credentials
): Action<Profile> => {
  return pipe(
    apiFromToken,
    TE.chain(({ user }) => user.update(uid, creds))
  );
};

export const deleteUser = (uid: UserId): Action<Id> => {
  return pipe(
    apiFromToken,
    TE.chain(({ user }) => user.delete(uid))
  );
};
