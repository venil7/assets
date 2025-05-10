import { authError } from "@darkruby/assets-core";
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

export const getProfile = (res: Parameters<RequestHandler>[1]) =>
  pipe(res.locals["profile"], liftTE(ProfileDecoder));

export const getAdminProfile = (res: Parameters<RequestHandler>[1]) =>
  pipe(
    getProfile(res),
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
    TE.chainFirstIOK((x) => () => console.log(x)),
    TE.chain(({ profile }) => createToken(profile)),
    TE.mapLeft(toWebError)
  );

export const refreshToken: HandlerTask<Token, Context> = ({
  params: [, res],
}) =>
  pipe(
    TE.Do,
    TE.bind("profile", () => getProfile(res)),
    TE.chain(({ profile }) => createToken(profile)),
    TE.mapLeft(toWebError)
  );

export const verifyToken: HandlerTask<void, Context> = ({
  params: [req, res],
}) =>
  pipe(
    TE.Do,
    TE.bind("jwt", () => verifyBearer(req.header("authorization"))),
    TE.chain(({ jwt }) => pipe(jwt.payload, liftTE(ProfileDecoder))),
    TE.mapLeft(toWebError),
    TE.chain((profile) => {
      res.locals["profile"] = profile;
      return TE.left(next());
    })
  );
