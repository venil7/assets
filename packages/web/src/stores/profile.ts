import type {
  ActionResult,
  Credentials,
  Identity,
  Nullable,
  Profile,
} from "@darkruby/assets-core";
import { signal } from "@preact/signals-react";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import {
  deleteProfile,
  getProfile,
  updateCredentials,
} from "../services/profile";
import { type StoreBase, createStoreBase } from "./base";

export type ProfileStore = Identity<
  StoreBase<Nullable<Profile>> & {
    load: () => ActionResult<Nullable<Profile>>;
    update: (c: Credentials) => ActionResult<Nullable<Profile>>;
    delete: () => ActionResult<Nullable<Profile>>;
  }
>;

export const createProfileStore = (): ProfileStore => {
  const data = signal<Nullable<Profile>>(null);
  const storeBase = createStoreBase(data);

  return {
    ...storeBase,
    load: () => storeBase.run(getProfile()),
    update: (c: Credentials) => storeBase.run(updateCredentials(c)),
    delete: () =>
      storeBase.run(
        pipe(
          deleteProfile(),
          TE.map(() => null)
        )
      ),
  };
};
