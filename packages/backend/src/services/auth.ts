import { authError, type Action, type Optional } from "@darkruby/assets-core";
import type { Token } from "@darkruby/assets-core/src/domain/token";
import {
  type Credentials,
  type Profile,
  type User,
} from "@darkruby/assets-core/src/domain/user";
import { compare } from "bcrypt";
import { identity, pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { sign, verify, type Jwt } from "jsonwebtoken";
import { env } from "./env";

export const verifyPassword = (
  { phash, psalt }: User,
  { password }: Credentials
): Action<any> => {
  return pipe(
    TE.tryCatch(
      () => compare(`${password}${psalt}`, phash),
      (e) => authError(`Unable to auth ${e}`)
    ),
    TE.filterOrElse(identity, (e) => authError("could not authenticate"))
  );
};

export const createToken = (profile: Profile): Action<Token> => {
  return pipe(
    TE.Do,
    TE.bind("secret", () => env("ASSETS_JWT_SECRET")),
    TE.bind("token", ({ secret }) =>
      TE.fromIO(() => sign(profile, secret, { expiresIn: "24h" }))
    ),
    TE.map(({ token }) => ({ token }))
  );
};

export const verifyBearer = (
  authorizationHeader: Optional<string>
): Action<Jwt> => {
  return pipe(
    TE.Do,
    TE.bind("token", () =>
      authorizationHeader
        ? TE.of(authorizationHeader.replace("Bearer ", ""))
        : TE.left(authError("no token"))
    ),
    TE.bind("secret", () => env("ASSETS_JWT_SECRET")),
    TE.chain(({ token, secret }) =>
      TE.tryCatch(
        async () => verify(token, secret, { complete: true }),
        (e) => authError(`invalid token ${e}`)
      )
    )
  );
};
