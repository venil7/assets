import type {
  Action,
  GetUser,
  Id,
  PasswordChange,
  PostUser
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { apiFromToken } from "./api";

const get = (): Action<GetUser> => {
  return pipe(
    apiFromToken,
    TE.chain(({ profile }) => profile.get())
  );
};

const delete1 = (): Action<Id> => {
  return pipe(
    apiFromToken,
    TE.chain(({ profile }) => profile.delete())
  );
};

const update = (usr: PostUser): Action<GetUser> => {
  return pipe(
    apiFromToken,
    TE.chain(({ profile }) => profile.update(usr))
  );
};

const password = (c: PasswordChange): Action<GetUser> => {
  return pipe(
    apiFromToken,
    TE.chain(({ profile }) => profile.password(c))
  );
};

export const profile = {
  get,
  update,
  delete: delete1,
  password
};
