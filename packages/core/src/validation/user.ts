import * as E from "fp-ts/lib/Either";
import { flow, pipe } from "fp-ts/lib/function";
import {
  NewUserDecoder,
  PasswordChangeDecoder,
  PostUserDecoder
} from "../decoders/user";
import { chainDecoder } from "../decoders/util";
import {
  alphaNumOnly,
  createValidator,
  length,
  match,
  noWhiteSpace,
  startsWithLetter
} from "../validation/util";

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

export const postUserValidator = pipe(
  PostUserDecoder,
  chainDecoder((user) =>
    pipe(
      E.Do,
      shortUsername(user.username),
      E.map(() => user)
    )
  ),
  createValidator
);

export const newUserValidator = pipe(
  NewUserDecoder,
  chainDecoder((newUser) =>
    pipe(
      E.Do,
      shortUsername(newUser.username),
      shortPassword(newUser.password),
      E.map(() => newUser)
    )
  ),
  createValidator
);

export const passwordChangeValidator = pipe(
  PasswordChangeDecoder,
  chainDecoder(({ oldPassword, newPassword, repeat }) =>
    pipe(
      E.Do,
      match(newPassword, repeat),
      shortPassword(newPassword),
      E.map(() => ({ oldPassword, newPassword, repeat }))
    )
  ),
  createValidator
);
