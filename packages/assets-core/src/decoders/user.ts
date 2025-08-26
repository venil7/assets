import { pipe } from "fp-ts/lib/function";
import type { Refinement } from "fp-ts/lib/Refinement";
import * as t from "io-ts";
import { boolean, dateDecoder, nonEmptyString } from "./util";

export const UserIdDecoder = t.brand(
  t.number,
  ((a) => a >= 0 && a == Math.floor(a)) as Refinement<
    number,
    t.Branded<number, { readonly UserId: symbol }>
  >,
  "UserId"
);

const credentialsTypes = {
  username: nonEmptyString,
  password: nonEmptyString,
};

const passwordChangeTypes = {
  password: nonEmptyString,
  repeat: nonEmptyString,
};

const profileTypes = {
  id: UserIdDecoder,
  username: t.string,
  admin: boolean,
  login_attempts: t.number,
  locked: boolean,
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
  login_attempts: t.number,
  locked: boolean,
};

export const CredenatialsDecoder = t.type(credentialsTypes);
export const ProfileDecoder = pipe(t.type(profileTypes), t.exact);
export const ProfilesDecoder = t.array(ProfileDecoder);

export const GetUserDecoder = t.type(getUserTypes);
export const GetUsersDecoder = t.array(GetUserDecoder);

export const PostUserDecoder = t.type(postUserTypes);

export const PasswordChangeDecoder = t.type(passwordChangeTypes);
