import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { CredenatialsDecoder, PasswordChangeDecoder } from "../decoders/user";
import { mapDecoder } from "../decoders/util";
import { createValidator, length, match } from "../validation/util";

const length12 = length(12);

export const passwordChangeValidator = pipe(
  mapDecoder(PasswordChangeDecoder, ({ oldPassword, newPassword, repeat }) =>
    pipe(
      E.Do,
      match(newPassword, repeat),
      length(5)(newPassword),
      // length12(newPassword),
      // upper(newPassword),
      // lower(newPassword),
      // numbers(newPassword),
      // special(newPassword),
      E.map(() => ({ oldPassword, newPassword, repeat }))
    )
  ),
  createValidator
);

export const credentialsValidator = pipe(
  mapDecoder(CredenatialsDecoder, ({ username, password }) =>
    pipe(
      E.Do,
      length(5)(username),
      length(5)(password),
      E.map(() => ({ username, password }))
    )
  ),
  createValidator
);
