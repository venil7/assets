import type {
  ActionResult,
  GetUser,
  Identity,
  NewUser,
  PasswordChange,
  PostUser,
  UserId
} from "@darkruby/assets-core";
import { signal } from "@preact/signals-react";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { users } from "../services/users";
import { type StoreBase, createStoreBase } from "./base";

export type UsersStore = Identity<
  StoreBase<GetUser[]> & {
    load: () => ActionResult<GetUser[]>;
    create: (creds: NewUser) => ActionResult<GetUser[]>;
    update: (uid: UserId, credes: PostUser) => ActionResult<GetUser[]>;
    password: (uid: UserId, credes: PasswordChange) => ActionResult<GetUser[]>;
    delete: (uid: UserId) => ActionResult<GetUser[]>;
  }
>;

export const createUsersStore = (): UsersStore => {
  const data = signal<GetUser[]>([]);
  const storeBase = createStoreBase(data);

  return {
    ...storeBase,
    load: () => storeBase.run(users.getMany()),
    create: (creds: NewUser) =>
      storeBase.run(
        pipe(
          users.create(creds),
          TE.chain(() => users.getMany())
        )
      ),
    update: (uid: UserId, creds: PostUser) =>
      storeBase.run(
        pipe(
          users.update(uid, creds),
          TE.chain(() => users.getMany())
        )
      ),
    password: (uid: UserId, pwd: PasswordChange) =>
      storeBase.run(
        pipe(
          users.password(uid, pwd),
          TE.chain(() => users.getMany())
        )
      ),
    delete: (uid: UserId) =>
      storeBase.run(
        pipe(
          users.delete(uid),
          TE.chain(() => users.getMany())
        )
      )
  };
};
