import type { UserId } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import type { Repository } from "../repository";
import { toAdminUser } from "./auth";
import { env } from "./env";

const defaultUser = pipe(
  TE.Do,
  TE.apS("username", env("ASSETS_USERNAME", "admin")),
  TE.apS("password", env("ASSETS_PASSWORD", "admin")),
  TE.chain(toAdminUser)
);

export const initializeApp = (repo: Repository) => {
  // check to see if first user exists;
  // if not create with default values
  return pipe(
    TE.Do,
    TE.bind("user", () => repo.user.get(1 as UserId)),
    TE.orElseW(() => pipe(defaultUser, TE.chain(repo.user.create)))
  );
};
