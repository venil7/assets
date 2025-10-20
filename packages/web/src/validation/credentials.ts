import {
  CredenatialsDecoder,
  PasswordChangeDecoder,
} from "@darkruby/assets-core/src/decoders/user";
import {
  mapDecoder,
  validationErr,
} from "@darkruby/assets-core/src/decoders/util";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { createValidator } from "../util/validation";

const filter = (predicate: () => boolean, message: string) =>
  E.filterOrElse(predicate, () => [validationErr(message)]);

const match = (pwd: string, pwd2: string) =>
  filter(() => pwd == pwd2, `paswords do not match`);
const length = (n: number) => (pwd: string) =>
  filter(() => pwd.length >= n, `length must be >=${n}`);
const upper = (pwd: string) =>
  filter(() => /[A-Z]/.test(pwd), `uppercase characters missing`);
const lower = (pwd: string) =>
  filter(() => /[a-z]/.test(pwd), `lower characters missing`);
const numbers = (pwd: string) =>
  filter(() => /\d/.test(pwd), `number characters missing`);
const special = (pwd: string) =>
  filter(() => /\W/.test(pwd), `special characters missing`);

const PasswordChangeValidation = mapDecoder(
  PasswordChangeDecoder,
  ({ password, repeat }) =>
    pipe(
      E.Do,
      match(password, repeat),
      length(12)(password),
      upper(password),
      lower(password),
      numbers(password),
      special(password),
      E.map(() => ({ password, repeat }))
    )
);

export const passwordChangeValidator = createValidator(
  PasswordChangeValidation
);

const CredentialsValidation = mapDecoder(
  CredenatialsDecoder,
  ({ username, password }) =>
    pipe(
      E.Do,
      length(5)(username),
      length(5)(password),
      E.map(() => ({ username, password }))
    )
);

export const credentialsValidator = createValidator(CredentialsValidation);
