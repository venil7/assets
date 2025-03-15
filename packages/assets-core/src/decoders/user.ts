import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { boolean, dateDecoder } from "./util";

const loginTypes = {
  username: t.string,
  password: t.string,
};

const profileTypes = {
  id: t.number,
  username: t.string,
  admin: boolean,
  created: dateDecoder,
  modified: dateDecoder,
};

const userTypes = {
  ...profileTypes,
  phash: t.string,
  psalt: t.string,
};

export const LoginDecoder = t.type(loginTypes);
export const ProfileDecoder = pipe(t.type(profileTypes), t.exact);
export const UserDecoder = t.type(userTypes);
