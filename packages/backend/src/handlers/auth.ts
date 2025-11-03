import { authError } from "@darkruby/assets-core";
import {
  CredenatialsDecoder,
  ProfileDecoder,
} from "@darkruby/assets-core/src/decoders/user";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import type { Token } from "@darkruby/assets-core/src/domain/token";
import { type HandlerTask, next } from "@darkruby/fp-express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { mapWebError } from "../domain/error";
import { createToken, verifyBearer, verifyPassword } from "../services/auth";
import type { Context } from "./context";

export const login: HandlerTask<Token, Context> = ({
  params: [req],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("creds", () => pipe(req.body, liftTE(CredenatialsDecoder))),
    TE.bind("user", ({ creds }) => repo.user.loginAttempt(creds.username)),
    TE.bind("auth", ({ creds, user }) =>
      verifyPassword(user.phash, creds.password)
    ),
    TE.bind("reset", ({ user }) => repo.user.loginSuccess(user.username)),
    TE.bind("profile", ({ user }) => liftTE(ProfileDecoder)(user)),
    TE.chain(({ profile }) => createToken(profile)),
    mapWebError
  );

export const refreshToken: HandlerTask<Token, Context> = ({
  params: [, res],
  context: { service },
}) =>
  pipe(
    TE.Do,
    TE.bind("profile", () => service.auth.requireProfile(res)),
    TE.chain(({ profile }) => createToken(profile)),
    mapWebError
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
    mapWebError,
    TE.chain(({ profile }) => {
      res.locals["profile"] = profile;
      return TE.left(next());
    })
  );
