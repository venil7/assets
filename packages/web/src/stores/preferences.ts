import type {
  ActionResult,
  Identity,
  Nullable,
  Preferences,
} from "@darkruby/assets-core";
import { signal } from "@preact/signals-react";
import { getPreferences, updateCredentials } from "../services/preferences";
import { type StoreBase, createStoreBase } from "./base";

export type PreferencesStore = Identity<
  StoreBase<Nullable<Preferences>> & {
    load: () => ActionResult<Nullable<Preferences>>;
    update: (c: Preferences) => ActionResult<Nullable<Preferences>>;
  }
>;

export const createPreferencesStore = (): PreferencesStore => {
  const data = signal<Nullable<Preferences>>(null);
  const storeBase = createStoreBase(data);

  return {
    ...storeBase,
    load: () => storeBase.run(getPreferences()),
    update: (p: Preferences) => storeBase.run(updateCredentials(p)),
  };
};
