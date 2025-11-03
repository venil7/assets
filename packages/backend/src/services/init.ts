import { authError } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import type { Repository } from "../repository";
import { env } from "./env";
import { toRawInUser } from "./user";

const defaultUser = pipe(
  TE.Do,
  TE.apS("username", env("ASSETS_USERNAME", "admin")),
  TE.apS("password", env("ASSETS_PASSWORD", "admin")),
  TE.apS("admin", TE.of(true)),
  TE.apS("locked", TE.of(false)),
  TE.chain(toRawInUser)
);

export const initializeApp = (repo: Repository) => {
  // check to see if first user exists;
  // if not create with default values
  return pipe(
    TE.Do,
    TE.bind("users", () => repo.user.getAll()),
    TE.filterOrElse(
      ({ users }) => users.length > 0,
      () => authError("Admin user not found")
    ),
    TE.orElseW(() => pipe(defaultUser, TE.chain(repo.user.create)))
  );
};
