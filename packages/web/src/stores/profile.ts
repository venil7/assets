import type { Identity, Nullable, Profile } from "@darkruby/assets-core";
import { signal } from "@preact/signals-react";
import { getProfile } from "../services/profile";
import { type StoreBase, createStoreBase } from "./base";

export type ProfileStore = Identity<
  StoreBase<Nullable<Profile>> & {
    load: (force?: boolean) => Promise<unknown>;
  }
>;

export const createProfileStore = (): ProfileStore => {
  const data = signal<Nullable<Profile>>(null);
  const storeBase = createStoreBase(data);

  return {
    ...storeBase,
    load: (force = true) => storeBase.run(getProfile(), force),
  };
};
