import { authError, type Action, type Optional } from "@darkruby/assets-core";
import { PostUserDecoder } from "@darkruby/assets-core/src/decoders/user";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import type { Token } from "@darkruby/assets-core/src/domain/token";
import {
  type Credentials,
  type GetUser,
  type PostUser,
  type Profile,
} from "@darkruby/assets-core/src/domain/user";
import { compare, genSaltSync, hashSync } from "bcrypt";
import { identity, pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { sign, verify, type Jwt } from "jsonwebtoken";
import { env, envDurationSec } from "./env";

export const verifyPassword = (
  { phash }: GetUser,
  { password }: Credentials
): Action<boolean> => {
  return pipe(
    TE.tryCatch(
      () => compare(password, phash),
      (e) => authError(`Unable to auth ${e}`)
    ),
    TE.filterOrElse(identity, (e) => authError("wrong password?"))
  );
};

export const createToken = (profile: Profile): Action<Token> => {
  return pipe(
    TE.Do,
    // valid values: https://www.npmjs.com/package/ms
    TE.bind("expiresIn", () => envDurationSec("ASSETS_JWT_EXPIRES_IN", "24h")),
    TE.bind("refreshBefore", () =>
      envDurationSec("ASSETS_JWT_REFRESH_BEFORE", "12h")
    ),
    TE.bind("secret", () => env("ASSETS_JWT_SECRET")),
    TE.bind("token", ({ secret, expiresIn }) =>
      TE.fromIO(() => sign(profile, secret, { expiresIn }))
    ),
    TE.map(({ token, refreshBefore }) => ({ token, refreshBefore }))
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

const toUser =
  (admin: boolean = false) =>
  ({ username, password }: Credentials): Action<PostUser> => {
    return pipe(
      TE.Do,
      TE.bind("psalt", () => TE.of(genSaltSync())),
      TE.bind("phash", ({ psalt }) => TE.of(hashSync(password, psalt))),
      TE.chain(({ phash, psalt }) =>
        TE.of({ phash, psalt, username, admin, login_attempts: 0, locked: 0 })
      ),
      TE.chain(liftTE(PostUserDecoder))
    );
  };

export const toNonAdminUser = toUser(false);
export const toAdminUser = toUser(true);
