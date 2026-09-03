import * as E from "fp-ts/lib/Either";
import { flow, pipe } from "fp-ts/lib/function";
import type { Refinement } from "fp-ts/lib/Refinement";
import * as t from "io-ts";
import { BooleanDecoder } from "./boolean";
import { dateDecoder } from "./date";
import {
  alphaNumOnly,
  chainDecoder,
  length,
  match,
  nonEmptyField,
  noWhiteSpace,
  startsWithLetter
} from "./util";

const atLeast3 = length(3);
const atLeast5 = length(5);

export const shortPassword = (pwd: string) =>
  flow(atLeast5(pwd), noWhiteSpace(pwd));

export const shortUsername = (username: string) =>
  flow(
    atLeast3(username),
    startsWithLetter(username),
    alphaNumOnly(username),
    noWhiteSpace(username)
  );

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

export const NewUserDecoder = pipe(
  t.type(newUserTypes),
  t.exact,
  chainDecoder((newUser) =>
    pipe(
      E.Do,
      shortUsername(newUser.username),
      shortPassword(newUser.password),
      E.map(() => newUser)
    )
  )
);
export const GetUserDecoder = pipe(t.type(getUserTypes), t.exact);
export const GetUsersDecoder = t.array(GetUserDecoder);

export const PostUserDecoder = pipe(
  t.type(postUserTypes),
  t.exact,
  chainDecoder((user) =>
    pipe(
      E.Do,
      shortUsername(user.username),
      E.map(() => user)
    )
  )
);

export const PasswordChangeDecoder = pipe(
  t.type(passwordChangeTypes),
  t.exact,
  chainDecoder((changePwd) =>
    pipe(
      E.Do,
      match(changePwd.newPassword, changePwd.repeat),
      shortPassword(changePwd.newPassword),
      E.map(() => changePwd)
    )
  )
);
