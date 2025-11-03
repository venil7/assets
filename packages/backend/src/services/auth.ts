import {
  AppErrorType,
  authError,
  handleError,
  ProfileDecoder,
  type Action,
  type Optional,
  type Profile,
  type UserId,
} from "@darkruby/assets-core";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import type { Token } from "@darkruby/assets-core/src/domain/token";
import { compare } from "bcrypt";
import type { RequestHandler } from "express";
import { identity, pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { sign, verify, type Jwt } from "jsonwebtoken";
import { env, envDurationSec } from "./env";

export type WebRequest = Parameters<RequestHandler>[0];
export type WebResponse = Parameters<RequestHandler>[1];

export const requireProfile = (res: WebResponse): Action<Profile> =>
  pipe(res.locals["profile"], liftTE(ProfileDecoder));

export const requireUserId = (res: WebResponse): Action<UserId> =>
  pipe(
    requireProfile(res),
    TE.map((p) => p.id)
  );

export const requireAdminProfile = (res: WebResponse) =>
  pipe(
    requireProfile(res),
    TE.filterOrElse(
      (u) => u.admin,
      () => authError(`Requires admin role.`)
    )
  );

export const verifyPassword = (
  phash: string, // <-- actual pasword
  password: string // <--- provided password
): Action<boolean> => {
  return pipe(
    TE.tryCatch(
      () => compare(password, phash),
      handleError("Unable to auth", AppErrorType.Auth)
    ),
    TE.filterOrElse(identity, () => authError("Wrong password?"))
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
        handleError("Invalid token", AppErrorType.Auth)
      )
    )
  );
};
