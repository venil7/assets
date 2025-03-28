import { authError, type Action } from "@darkruby/assets-core";
import { GetUserDecoder } from "@darkruby/assets-core/src/decoders/user";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import type {
  GetUser,
  PostUser,
  UserId,
} from "@darkruby/assets-core/src/domain/user";
import type Database from "bun:sqlite";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { execute, queryOne, type ExecutionResult } from "./database";

export const getUserByUsername =
  (db: Database) =>
  (username: string): Action<GetUser> =>
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
      TE.chain(liftTE(GetUserDecoder))
    );

export const getUser =
  (db: Database) =>
  (userId: UserId): Action<GetUser> =>
    pipe(
      db,
      queryOne(
        `
        select phash, psalt, created, modified, id, username, admin
        from users u
        where u.id = $userId
        limit 1;
        `,
        { userId }
      ),
      TE.chain(liftTE(GetUserDecoder))
    );

export const createUser =
  (db: Database) =>
  (user: PostUser): Action<ExecutionResult> => {
    return pipe(
      db,
      execute(
        `
          insert into users(username, phash, psalt, admin)
          values ($username, $phash, $psalt, $admin);
          `,
        user
      )
    );
  };

export const updateUser =
  (db: Database) =>
  (user: PostUser, userId: UserId): Action<ExecutionResult> => {
    return pipe(
      db,
      execute(
        `
          update users
          set username=$username, phash=$phash, psalt=$psalt, admin=$admin
          where id=$userId
          `,
        { ...user, userId }
      )
    );
  };
