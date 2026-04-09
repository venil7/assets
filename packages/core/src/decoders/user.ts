import { pipe } from "fp-ts/lib/function";
import type { Refinement } from "fp-ts/lib/Refinement";
import * as t from "io-ts";
import { nonEmptyField } from "../validation/util";
import { BooleanDecoder } from "./boolean";
import { dateDecoder } from "./date";

export const UserIdDecoder = t.brand(
  t.number,
  ((a) => a >= 0 && a == Math.floor(a)) as Refinement<
    number,
    t.Branded<number, { readonly UserId: symbol }>
  >,
  "UserId"
);

const credentialsTypes = {
  username: nonEmptyField("username"),
  password: nonEmptyField("password")
};

const passwordChangeTypes = {
  oldPassword: nonEmptyField("old password"),
  newPassword: nonEmptyField("new password"),
  repeat: nonEmptyField("repeat password")
};

const newUserTypes = {
  admin: BooleanDecoder,
  username: t.string,
  password: t.string,
  locked: BooleanDecoder
};

const profileTypes = {
  id: UserIdDecoder,
  username: t.string,
  admin: BooleanDecoder
};

const getUserTypes = {
  id: UserIdDecoder,
  username: t.string,
  admin: BooleanDecoder,
  login_attempts: t.number,
  locked: BooleanDecoder,
  created: dateDecoder,
  modified: dateDecoder
};

const rawInUserTypes = {
  username: t.string,
  admin: BooleanDecoder,
  login_attempts: t.number,
  locked: BooleanDecoder,
  phash: t.string,
  psalt: t.string
};

const rawOutUserTypes = {
  id: UserIdDecoder,
  ...rawInUserTypes,
  created: dateDecoder,
  modified: dateDecoder
};

const postUserTypes = {
  username: t.string,
  admin: BooleanDecoder,
  login_attempts: t.number,
  locked: BooleanDecoder
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
