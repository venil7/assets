import {
  authError,
  type Result,
  type Token,
  TokenDecoder,
} from "@darkruby/assets-core";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { storage } from "./storage";

const TOKEN_KEY = "assets_token";
const tokenStorage = storage<Token>(TokenDecoder);

export const readToken = (): Result<Token> => {
  return pipe(
    tokenStorage.read(TOKEN_KEY),
    E.mapLeft(() => authError(`Could not read token`))
  );
};
export const writeToken = (token: Token): Result<void> => {
  return tokenStorage.write(TOKEN_KEY, token);
};
export const removeToken = (): Result<void> => {
  return tokenStorage.remove(TOKEN_KEY);
};
