import type { Action, Api, Credentials, Token } from "@darkruby/assets-core";
import { api as coreApi, login as coreLogin } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { env } from "./env";
import { readToken, writeToken } from "./token";

export const baseUrl = () =>
  pipe(env("VITE_ASSETS_URL", `http://localhost:4020`), TE.fromEither);

export const login = (form: Credentials): Action<Token> => {
  return pipe(
    baseUrl(),
    TE.chain((url) => coreLogin(url)(form)),
    TE.tap((token) => pipe(writeToken(token), TE.fromEither))
  );
};

export const api = (token: Token): Action<Api> =>
  pipe(baseUrl(), TE.map(coreApi), TE.ap(TE.of(token)));

export const apiFromToken = pipe(readToken(), TE.fromEither, TE.chain(api));
