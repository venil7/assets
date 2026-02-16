import * as E from "fp-ts/lib/Either";
import { flow, pipe } from "fp-ts/lib/function";
import {
  NewUserDecoder,
  PasswordChangeDecoder,
  PostUserDecoder,
} from "../decoders/user";
import { chainDecoder } from "../decoders/util";
import {
  alphaNumOnly,
  createValidator,
  length,
  match,
  noWhiteSpace,
} from "../validation/util";

const length5 = length(5);

export const shortPassword = (pwd: string) =>
  flow(length5(pwd), noWhiteSpace(pwd));

export const shortUsername = (pwd: string) =>
  flow(length5(pwd), alphaNumOnly(pwd), noWhiteSpace(pwd));

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
