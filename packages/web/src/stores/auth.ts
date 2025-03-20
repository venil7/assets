import type {
  Action,
  Credentials,
  Identity,
  Nullable,
  Result,
  Token,
} from "@darkruby/assets-core";
import { computed, type ReadonlySignal, signal } from "@preact/signals-react";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { login } from "../services/api";
import { readToken } from "../services/token";
import { createStoreBase, type StoreBase } from "./base";

export type AuthStore = Identity<
  StoreBase<Nullable<Token>> & {
    load: () => Promise<Result<Nullable<Token>>>;
    tokenExists: ReadonlySignal<boolean>;
    login: (form: Credentials) => Promise<unknown>;
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
    load: () => storeBase.update(getToken),
    login: (form: Credentials) => storeBase.update(login(form)),
  };
};
