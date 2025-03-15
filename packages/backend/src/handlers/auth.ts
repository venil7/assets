import {
  LoginDecoder,
  ProfileDecoder,
} from "@darkruby/assets-core/src/decoders/user";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import type { Token } from "@darkruby/assets-core/src/domain/token";
import { next, type HandlerTask } from "@darkruby/fp-express";
import { Database } from "bun:sqlite";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { toWebError } from "../domain/error";
import { getUserByUsername } from "../repository/user";
import { createToken, verifyBearer, verifyPassword } from "../services/auth";

export type DatabaseCtx = {
  db: Database;
};

export const login: HandlerTask<Token, DatabaseCtx> = ({
  params: [req],
  context: { db },
}) =>
  pipe(
    TE.Do,
    TE.bind("login", () => pipe(req.body, liftTE(LoginDecoder))),
    TE.bind("user", ({ login }) => getUserByUsername(db)(login.username)),
    TE.bind("auth", ({ login, user }) => verifyPassword(user, login)),
    TE.chain(({ user }) => createToken(user)),
    TE.mapLeft(toWebError)
  );

export const refreshToken: HandlerTask<Token, DatabaseCtx> = ({
  params: [, res],
}) =>
  pipe(
    TE.Do,
    TE.bind("profile", () =>
      pipe(res.locals["profile"], liftTE(ProfileDecoder))
    ),
    TE.chain(({ profile }) => createToken(profile)),
    TE.mapLeft(toWebError)
  );

export const verifyToken: HandlerTask<void, DatabaseCtx> = ({
  params: [req, res],
}) =>
  pipe(
    TE.Do,
    TE.bind("jwt", () => verifyBearer(req.header("authorization"))),
    TE.mapLeft(toWebError),
    TE.chain(({ jwt: { payload } }) => {
      res.locals["profile"] = payload;
      return TE.left(next());
    })
  );
