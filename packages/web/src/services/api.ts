import type {
  Action,
  Api,
  AppError,
  Credentials,
  Token,
} from "@darkruby/assets-core";
import { api as coreApi, login as coreLogin } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { env } from "./env";
import { readToken, removeToken, writeToken } from "./token";

export const baseUrl = (): Action<string> => {
  return pipe(env("VITE_ASSETS_URL", ""), TE.fromEither<AppError, string>);
};

export const login = (creds: Credentials): Action<Token> => {
  return pipe(
    baseUrl(),
    TE.chain((url) => coreLogin(url)(creds)),
    TE.tap((token) => pipe(writeToken(token), TE.fromEither))
  );
};

export const logout = (): Action<null> => {
  return pipe(
    removeToken(),
    TE.fromEither,
    TE.map(() => null)
  );
};

export const api = (token: Token): Action<Api> =>
  pipe(baseUrl(), TE.map(coreApi), TE.ap(TE.of(token)));

export const apiFromToken = pipe(readToken, TE.fromIOEither, TE.chain(api));
