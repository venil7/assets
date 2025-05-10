import type {
  ActionResult,
  Credentials,
  Identity,
  Nullable,
  Profile,
} from "@darkruby/assets-core";
import { signal } from "@preact/signals-react";
import { getProfile, updateCredentials } from "../services/profile";
import { type StoreBase, createStoreBase } from "./base";

export type ProfileStore = Identity<
  StoreBase<Nullable<Profile>> & {
    load: () => ActionResult<Nullable<Profile>>;
    update: (c: Credentials) => ActionResult<Nullable<Profile>>;
  }
>;

export const createProfileStore = (): ProfileStore => {
  const data = signal<Nullable<Profile>>(null);
  const storeBase = createStoreBase(data);

  return {
    ...storeBase,
    load: () => storeBase.run(getProfile()),
    update: (c: Credentials) => storeBase.run(updateCredentials(c)),
  };
};
