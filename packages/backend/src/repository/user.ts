import { authError, type Action } from "@darkruby/assets-core";
import {
  GetUserDecoder,
  GetUsersDecoder,
} from "@darkruby/assets-core/src/decoders/user";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import type {
  GetUser,
  PostUser,
  UserId,
} from "@darkruby/assets-core/src/domain/user";
import type Database from "bun:sqlite";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { defaultPaging } from "../domain/paging";
import {
  execute,
  queryMany,
  queryOne,
  transaction,
  type ExecutionResult,
} from "./database";

export const loginAttempt =
  (db: Database) =>
  (username: string): Action<GetUser> => {
    const attempt = db.prepare(`
      update users
      set login_attempts = login_attempts + 1
      where username=$username;
    `);
    const getUser = db.prepare(`
      select phash, psalt, created, modified, id, username, admin, login_attempts, locked
      from users u
      where u.username=$username
            and u.login_attempts<3
            and u.locked<1
      limit 1;
    `);
    return pipe(
      db,
      transaction(() => {
        attempt.run({ username });
        return getUser.get({ username });
      }),
      TE.filterOrElse(
        (x) => !!x,
        () => authError("could not authenticate")
      ),
      TE.chain(liftTE(GetUserDecoder))
    );
  };

export const loginSuccess =
  (db: Database) =>
  (username: string): Action<any> =>
    pipe(
      db,
      execute(
        `
        update users
        set login_attempts=0
        where username=$username and login_attempts>0;
        `,
        { username }
      ),
      TE.filterOrElse(Boolean, () => authError("failed to reset login"))
    );

export const getUsers =
  (db: Database) =>
  (paging = defaultPaging()): Action<GetUser[]> =>
    pipe(
      db,
      queryMany(
        `
        select id, username, admin, login_attempts, locked, phash, psalt, created, modified
        from users u
        limit $limit offset $offset;
        `,
        paging
      ),
      TE.chain(liftTE(GetUsersDecoder))
    );

export const getUser =
  (db: Database) =>
  (userId: UserId): Action<GetUser> =>
    pipe(
      db,
      queryOne(
        `
        select phash, psalt, created, modified, id, username, admin, login_attempts, locked
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
  (userId: UserId, user: PostUser): Action<ExecutionResult> => {
    return pipe(
      db,
      execute(
        `
          update users
          set username=$username, phash=$phash, psalt=$psalt,
              admin=$admin, login_attempts=$login_attempts, locked=$locked
          where id=$userId;
          `,
        { ...user, userId }
      )
    );
  };

export const deleteUser =
  (db: Database) =>
  (userId: UserId): Action<ExecutionResult> =>
    pipe(
      db,
      execute<unknown[]>(
        `
        delete from users
        where id=$userId;
      `,
        { userId }
      )
    );
