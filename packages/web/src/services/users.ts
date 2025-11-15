import type {
  Action,
  GetUser,
  Id,
  NewUser,
  PostUser,
  Profile,
  UserId,
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { apiFromToken } from "./api";

export const getUsers = (): Action<GetUser[]> => {
  return pipe(
    apiFromToken,
    TE.chain(({ user }) => user.getMany())
  );
};

export const getUser = (uid: UserId): Action<GetUser> => {
  return pipe(
    apiFromToken,
    TE.chain(({ user }) => user.get(uid))
  );
};

export const createUser = (creds: NewUser): Action<GetUser> => {
  return pipe(
    apiFromToken,
    TE.chain(({ user }) => user.create(creds))
  );
};

export const updateUser = (uid: UserId, creds: PostUser): Action<Profile> => {
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
