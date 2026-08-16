import type {
  Action,
  GetUser,
  Id,
  NewUser,
  PasswordChange,
  PostUser,
  Profile,
  UserId
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { apiFromToken } from "./api";

const getMany = (): Action<GetUser[]> => {
  return pipe(
    apiFromToken,
    TE.chain(({ user }) => user.getMany())
  );
};

const get = (uid: UserId): Action<GetUser> => {
  return pipe(
    apiFromToken,
    TE.chain(({ user }) => user.get(uid))
  );
};

const create = (creds: NewUser): Action<GetUser> => {
  return pipe(
    apiFromToken,
    TE.chain(({ user }) => user.create(creds))
  );
};

const update = (uid: UserId, creds: PostUser): Action<Profile> => {
  return pipe(
    apiFromToken,
    TE.chain(({ user }) => user.update(uid, creds))
  );
};

const password = (uid: UserId, pwd: PasswordChange): Action<Profile> => {
  return pipe(
    apiFromToken,
    TE.chain(({ user }) => user.password(uid, pwd))
  );
};

const delete1 = (uid: UserId): Action<Id> => {
  return pipe(
    apiFromToken,
    TE.chain(({ user }) => user.delete(uid))
  );
};

export const users = {
  get,
  getMany,
  create,
  update,
  delete: delete1,
  password
};
