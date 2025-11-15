import type {
  ActionResult,
  GetUser,
  Identity,
  NewUser,
  PostUser,
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
  StoreBase<GetUser[]> & {
    load: () => ActionResult<GetUser[]>;
    create: (creds: NewUser) => ActionResult<GetUser[]>;
    update: (uid: UserId, credes: PostUser) => ActionResult<GetUser[]>;
    delete: (uid: UserId) => ActionResult<GetUser[]>;
  }
>;

export const createUsersStore = (): UsersStore => {
  const data = signal<GetUser[]>([]);
  const storeBase = createStoreBase(data);

  return {
    ...storeBase,
    load: () => storeBase.run(getUsers()),
    create: (creds: NewUser) =>
      storeBase.run(
        pipe(
          createUser(creds),
          TE.chain(() => getUsers())
        )
      ),
    update: (uid: UserId, creds: PostUser) =>
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
