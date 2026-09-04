import {
  NewUserDecoder,
  PasswordChangeDecoder,
  PostUserDecoder
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import { createValidator } from "./util";

export const postUserValidator = pipe(PostUserDecoder, createValidator);

export const newUserValidator = pipe(NewUserDecoder, createValidator);

export const passwordChangeValidator = pipe(
  PasswordChangeDecoder,
  createValidator
);
