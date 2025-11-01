import {
  authError,
  type Action,
  type Profile,
  type UserId,
} from "@darkruby/assets-core";
import {
  CredenatialsDecoder,
  ProfileDecoder,
} from "@darkruby/assets-core/src/decoders/user";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import type { Token } from "@darkruby/assets-core/src/domain/token";
import { next, type HandlerTask } from "@darkruby/fp-express";
import type { RequestHandler } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { toWebError } from "../domain/error";
import { createToken, verifyBearer, verifyPassword } from "../services/auth";
import type { Context } from "./context";

export const requireProfile = (
  res: Parameters<RequestHandler>[1]
): Action<Profile> => pipe(res.locals["profile"], liftTE(ProfileDecoder));

export const requireUserId = (
  res: Parameters<RequestHandler>[1]
): Action<UserId> =>
  pipe(
    requireProfile(res),
    TE.map((p) => p.id)
  );

export const requireAdminProfile = (res: Parameters<RequestHandler>[1]) =>
  pipe(
    requireProfile(res),
    TE.filterOrElse(
      (u) => u.admin,
      () => authError(`not an admin`)
    )
  );

export const login: HandlerTask<Token, Context> = ({
  params: [req],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("creds", () => pipe(req.body, liftTE(CredenatialsDecoder))),
    TE.bind("user", ({ creds }) => repo.user.loginAttempt(creds.username)),
    TE.bind("auth", ({ creds, user }) => verifyPassword(user, creds)),
    TE.bind("reset", ({ user }) => repo.user.loginSuccess(user.username)),
    TE.bind("profile", ({ user }) => liftTE(ProfileDecoder)(user)),
    TE.chain(({ profile }) => createToken(profile)),
    TE.mapLeft(toWebError)
  );

export const refreshToken: HandlerTask<Token, Context> = ({
  params: [, res],
}) =>
  pipe(
    TE.Do,
    TE.bind("profile", () => requireProfile(res)),
    TE.chain(({ profile }) => createToken(profile)),
    TE.mapLeft(toWebError)
  );

export const verifyToken: HandlerTask<void, Context> = ({
  params: [req, res],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("jwt", () => verifyBearer(req.header("authorization"))),
    TE.bind("payload", ({ jwt }) => pipe(jwt.payload, liftTE(ProfileDecoder))),
    TE.bind("profile", ({ payload: { id } }) => repo.user.get(id)),
    TE.filterOrElse(
      ({ profile }) => !!profile && !profile.locked,
      () => authError("User restricted")
    ),
    TE.mapLeft(toWebError),
    TE.chain(({ profile }) => {
      res.locals["profile"] = profile;
      return TE.left(next());
    })
  );
