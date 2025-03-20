import { type Token, TokenDecoder } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import { storage } from "./storage";

const TOKEN_KEY = "assets_token";
const tokenStorage = storage<Token>(TokenDecoder);

export const readToken = () => pipe(tokenStorage.read(TOKEN_KEY));
export const writeToken = (token: Token) =>
  pipe(tokenStorage.write(TOKEN_KEY, token));
