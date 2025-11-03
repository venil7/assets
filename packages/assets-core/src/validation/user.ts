import * as E from "fp-ts/lib/Either";
import { flow, pipe } from "fp-ts/lib/function";
import { NewUserDecoder, PostUserDecoder } from "../decoders/user";
import { mapDecoder } from "../decoders/util";
import {
  alphaNumOnly,
  createValidator,
  length,
  noWhiteSpace,
} from "../validation/util";

const length5 = length(5);

export const shortPassword = (pwd: string) =>
  flow(length5(pwd), noWhiteSpace(pwd));

export const shortUsername = (pwd: string) =>
  flow(length5(pwd), alphaNumOnly(pwd));

export const postUserValidator = pipe(
  mapDecoder(PostUserDecoder, (user) =>
    pipe(
      E.Do,
      length5(user.username),
      noWhiteSpace(user.username),
      E.map(() => user)
    )
  ),
  createValidator
);

export const newUserValidator = pipe(
  mapDecoder(NewUserDecoder, (newUser) =>
    pipe(
      E.Do,
      shortUsername(newUser.username),
      shortPassword(newUser.password),
      E.map(() => newUser)
    )
  ),
  createValidator
);
