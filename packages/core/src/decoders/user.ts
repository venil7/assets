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
  oldPassword: nonEmptyString,
  newPassword: nonEmptyString,
  repeat: nonEmptyString,
};

const newUserTypes = {
  admin: boolean,
  username: t.string,
  password: t.string,
  locked: boolean,
};

const profileTypes = {
  id: UserIdDecoder,
  username: t.string,
  admin: boolean,
};

const getUserTypes = {
  id: UserIdDecoder,
  username: t.string,
  admin: boolean,
  login_attempts: t.number,
  locked: boolean,
  created: dateDecoder,
  modified: dateDecoder,
};

const rawInUserTypes = {
  username: t.string,
  admin: boolean,
  login_attempts: t.number,
  locked: boolean,
  phash: t.string,
  psalt: t.string,
};

const rawOutUserTypes = {
  id: UserIdDecoder,
  ...rawInUserTypes,
  created: dateDecoder,
  modified: dateDecoder,
};

const postUserTypes = {
  username: t.string,
  admin: boolean,
  login_attempts: t.number,
  locked: boolean,
};

export const CredenatialsDecoder = t.type(credentialsTypes);
export const ProfileDecoder = pipe(t.type(profileTypes), t.exact);
export const ProfilesDecoder = t.array(ProfileDecoder);

export const RawInUserDecoder = t.type(rawInUserTypes);
export const RawOutUserDecoder = t.type(rawOutUserTypes);

export const NewUserDecoder = pipe(t.type(newUserTypes), t.exact);
export const GetUserDecoder = pipe(t.type(getUserTypes), t.exact);
export const GetUsersDecoder = t.array(GetUserDecoder);

export const PostUserDecoder = pipe(t.type(postUserTypes), t.exact);

export const PasswordChangeDecoder = pipe(t.type(passwordChangeTypes), t.exact);
