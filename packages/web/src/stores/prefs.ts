import type {
  ActionResult,
  Identity,
  Nullable,
  Prefs,
} from "@darkruby/assets-core";
import { signal } from "@preact/signals-react";
import { getPrefs, updatePrefs } from "../services/prefs";
import { type StoreBase, createStoreBase } from "./base";

export type PrefsStore = Identity<
  StoreBase<Nullable<Prefs>> & {
    load: () => ActionResult<Nullable<Prefs>>;
    update: (c: Prefs) => ActionResult<Nullable<Prefs>>;
  }
>;

export const createPrefsStore = (): PrefsStore => {
  const data = signal<Nullable<Prefs>>(null);
  const storeBase = createStoreBase(data);

  return {
    ...storeBase,
    load: () => storeBase.run(getPrefs()),
    update: (p: Prefs) => storeBase.run(updatePrefs(p)),
  };
};
