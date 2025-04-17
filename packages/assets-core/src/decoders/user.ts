import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { boolean, dateDecoder, nonEmptyString } from "./util";

const UserId = t.Int;

const credentialsTypes = {
  username: nonEmptyString,
  password: nonEmptyString,
};

const profileTypes = {
  id: UserId,
  username: t.string,
  admin: boolean,
};

const getUserTypes = {
  ...profileTypes,
  phash: t.string,
  psalt: t.string,
  created: dateDecoder,
  modified: dateDecoder,
};

const postUserTypes = {
  username: t.string,
  admin: boolean,
  phash: t.string,
  psalt: t.string,
};

export const CredenatialsDecoder = t.type(credentialsTypes);
export const ProfileDecoder = pipe(t.type(profileTypes), t.exact);
export const GetUserDecoder = t.type(getUserTypes);
export const PostUserDecoder = t.type(postUserTypes);
