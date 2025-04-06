import type {
  Action,
  ActionResult,
  Credentials,
  Identity,
  Nullable,
  Token,
} from "@darkruby/assets-core";
import { computed, type ReadonlySignal, signal } from "@preact/signals-react";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { login, logout } from "../services/api";
import { readToken } from "../services/token";
import { createStoreBase, type StoreBase } from "./base";

export type AuthStore = Identity<
  StoreBase<Nullable<Token>> & {
    load: () => ActionResult<Nullable<Token>>;
    login: (
      creds: Credentials,
      onSuccess: Action<void>
    ) => ActionResult<Nullable<Token>>;
    logout: () => ActionResult<Nullable<Token>>;
    tokenExists: ReadonlySignal<boolean>;
  }
>;

export const createAuthStore = (): AuthStore => {
  const data = signal<Nullable<Token>>(null);
  const storeBase = createStoreBase(data);

  const tokenExists = computed(() => data.value != null);

  const getToken: Action<Nullable<Token>> = pipe(
    readToken(),
    TE.fromEither,
    TE.orElseW(() => TE.of(null))
  );

  return {
    ...storeBase,
    tokenExists,
    load: () => storeBase.run(getToken),
    logout: () => storeBase.run(logout()),
    login: (creds, onSuccess) =>
      storeBase.run(
        pipe(
          login(creds),
          TE.tap(() => onSuccess)
        )
      ),
  };
};
