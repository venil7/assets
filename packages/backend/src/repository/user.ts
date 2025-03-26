import { authError, type Action } from "@darkruby/assets-core";
import { UserDecoder } from "@darkruby/assets-core/src/decoders/user";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import {
  type Credentials,
  type User,
} from "@darkruby/assets-core/src/domain/user";
import { genSaltSync, hashSync } from "bcrypt";
import type Database from "bun:sqlite";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { execute, queryOne, type ExecutionResult } from "./database";

export const getUserByUsername =
  (db: Database) =>
  (username: string): Action<User> =>
    pipe(
      db,
      queryOne(
        `
        select *
        from users u
        where u.username = $username
        limit 1;
        `,
        { username }
      ),
      TE.filterOrElse(
        (u) => !!u,
        () => authError("could not authenticate")
      ),
      TE.chain(liftTE(UserDecoder))
    );

export const createUser =
  (db: Database) =>
  ({ username, password }: Credentials): Action<ExecutionResult> => {
    const psalt = genSaltSync();
    const phash = hashSync(password, psalt);
    return pipe(
      db,
      execute(
        `
          insert into users(username, phash, psalt, admin)
          values ($username, $phash, $psalt, false);
          `,
        { username, phash, psalt }
      )
    );
  };
