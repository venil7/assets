import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { boolean, dateDecoder } from "./util";

const credentialsTypes = {
  username: t.string,
  password: t.string,
};

const profileTypes = {
  id: t.number,
  username: t.string,
  admin: boolean,
};

const userTypes = {
  ...profileTypes,
  phash: t.string,
  psalt: t.string,
  created: dateDecoder,
  modified: dateDecoder,
};

export const CredenatialsDecoder = t.type(credentialsTypes);
export const ProfileDecoder = pipe(t.type(profileTypes), t.exact);
export const UserDecoder = t.type(userTypes);
