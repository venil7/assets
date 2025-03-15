import { authError, type Action } from "@darkruby/assets-core";
import { UserDecoder } from "@darkruby/assets-core/src/decoders/user";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import { type User } from "@darkruby/assets-core/src/domain/user";
import type Database from "bun:sqlite";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { queryOne } from "./database";

export const getUserByUsername =
  (db: Database) =>
  (userName: string): Action<User> =>
    pipe(
      db,
      queryOne(`select * from users where username=$userName limit 1;`, {
        userName,
      }),
      TE.filterOrElse(
        (u) => !!u,
        () => authError("could not authenticate")
      ),
      TE.chain(liftTE(UserDecoder))
    );
