import type {
  ActionResult,
  GetUser,
  Identity,
  Nullable,
  PasswordChange,
  PostUser,
} from "@darkruby/assets-core";
import { signal } from "@preact/signals-react";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import {
  deleteProfile,
  getProfile,
  updatePassword,
  updateProfile,
} from "../services/profile";
import { type StoreBase, createStoreBase } from "./base";

export type ProfileStore = Identity<
  StoreBase<Nullable<GetUser>> & {
    load: () => ActionResult<Nullable<GetUser>>;
    update: (c: PostUser) => ActionResult<Nullable<GetUser>>;
    password: (c: PasswordChange) => ActionResult<Nullable<GetUser>>;
    delete: () => ActionResult<Nullable<GetUser>>;
  }
>;

export const createProfileStore = (): ProfileStore => {
  const data = signal<Nullable<GetUser>>(null);
  const storeBase = createStoreBase(data);

  return {
    ...storeBase,
    load: () => storeBase.run(getProfile()),
    update: (c: PostUser) => storeBase.run(updateProfile(c)),
    password: (c: PasswordChange) => storeBase.run(updatePassword(c)),
    delete: () =>
      storeBase.run(
        pipe(
          deleteProfile(),
          TE.map(() => null)
        )
      ),
  };
};
