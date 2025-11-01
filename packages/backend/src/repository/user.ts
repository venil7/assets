import { authError, type Action, type Optional } from "@darkruby/assets-core";
import {
  GetUserDecoder,
  GetUsersDecoder,
} from "@darkruby/assets-core/src/decoders/user";
import {
  liftTE,
  nullableDecoder,
} from "@darkruby/assets-core/src/decoders/util";
import type {
  GetUser,
  PostUser,
  UserId,
} from "@darkruby/assets-core/src/domain/user";
import type Database from "bun:sqlite";
import { pipe } from "fp-ts/lib/function";
import * as ID from "fp-ts/lib/Identity";
import * as TE from "fp-ts/lib/TaskEither";

import { defaultPaging } from "../domain/paging";
import {
  execute,
  queryMany,
  queryOne,
  transaction,
  type ExecutionResult,
} from "./database";

import {
  deleteUserSql,
  getUnlockedUserSql,
  getUserSql,
  getUsersSql,
  insertUserSql,
  loginAttemptUserSql,
  resetAttemptsSql,
  updateUserSql,
} from "./sql" with { type: "macro" };

const sql = {
  user: {
    get: TE.of(getUserSql()),
    getMany: TE.of(getUsersSql()),
    insert: TE.of(insertUserSql()),
    update: TE.of(updateUserSql()),
    delete: TE.of(deleteUserSql()),
    resetAttempts: TE.of(resetAttemptsSql()),
    getUnlocked: TE.of(getUnlockedUserSql()),
    loginAttempt: TE.of(loginAttemptUserSql()),
  },
};

export const loginAttempt =
  (db: Database) =>
  (username: string): Action<GetUser> => {
    return pipe(
      TE.Do,
      TE.let("db", () => db),
      TE.apS("loginAttemptSql", sql.user.loginAttempt),
      TE.apS("getUserSql", sql.user.getUnlocked),
      TE.let("attempt", ({ loginAttemptSql }) => db.prepare(loginAttemptSql)),
      TE.let("getUser", ({ getUserSql }) => db.prepare(getUserSql)),
      TE.chain(({ db, attempt, getUser }) =>
        transaction(() => {
          attempt.run({ username });
          return getUser.get({ username });
        })(db)
      ),
      TE.filterOrElse(Boolean, () => authError("could not authenticate")),
      TE.chain(liftTE(GetUserDecoder))
    );
  };

export const loginSuccess =
  (db: Database) =>
  (username: string): Action<any> =>
    pipe(
      execute({ username }),
      ID.ap(sql.user.resetAttempts),
      ID.ap(db),
      TE.filterOrElse(Boolean, () =>
        authError("failed to reset login attempts")
      )
    );

export const getUsers =
  (db: Database) =>
  (paging = defaultPaging()): Action<GetUser[]> =>
    pipe(
      queryMany(paging),
      ID.ap(sql.user.getMany),
      ID.ap(db),
      TE.chain(liftTE(GetUsersDecoder))
    );

export const getUser =
  (db: Database) =>
  (userId: UserId): Action<Optional<GetUser>> =>
    pipe(
      queryOne({ userId }),
      ID.ap(sql.user.get),
      ID.ap(db),
      TE.chain(liftTE(nullableDecoder(GetUserDecoder)))
    );

export const createUser =
  (db: Database) =>
  (user: PostUser): Action<ExecutionResult> => {
    return pipe(execute(user), ID.ap(sql.user.insert), ID.ap(db));
  };

export const updateUser =
  (db: Database) =>
  (userId: UserId, user: PostUser): Action<ExecutionResult> => {
    return pipe(
      execute({ ...user, userId }),
      ID.ap(sql.user.update),
      ID.ap(db)
    );
  };

export const deleteUser =
  (db: Database) =>
  (userId: UserId): Action<ExecutionResult> =>
    pipe(execute<unknown[]>({ userId }), ID.ap(sql.user.delete), ID.ap(db));
