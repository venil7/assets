import type {
  ActionResult,
  Credentials,
  Identity,
  Profile,
  UserId,
} from "@darkruby/assets-core";
import { signal } from "@preact/signals-react";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from "../services/users";
import { type StoreBase, createStoreBase } from "./base";

export type UsersStore = Identity<
  StoreBase<Profile[]> & {
    load: () => ActionResult<Profile[]>;
    create: (creds: Credentials) => ActionResult<Profile[]>;
    update: (uid: UserId, credes: Credentials) => ActionResult<Profile[]>;
    delete: (uid: UserId) => ActionResult<Profile[]>;
  }
>;

export const createUsersStore = (): UsersStore => {
  const data = signal<Profile[]>([]);
  const storeBase = createStoreBase(data);

  return {
    ...storeBase,
    load: () => storeBase.run(getUsers()),
    create: (creds: Credentials) =>
      storeBase.run(
        pipe(
          createUser(creds),
          TE.chain(() => getUsers())
        )
      ),
    update: (uid: UserId, creds: Credentials) =>
      storeBase.run(
        pipe(
          updateUser(uid, creds),
          TE.chain(() => getUsers())
        )
      ),
    delete: (uid: UserId) =>
      storeBase.run(
        pipe(
          deleteUser(uid),
          TE.chain(() => getUsers())
        )
      ),
  };
};
