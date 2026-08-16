import {
  GetUserDecoder,
  GetUsersDecoder,
  NewUserDecoder,
  RawInUserDecoder,
  type Action,
  type GetUser,
  type Id,
  type NewUser,
  type Optional,
  type RawInUser,
  type UserId
} from "@darkruby/assets-core";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import { password as Pwd } from "bun";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { mapWebError } from "../domain/error";
import { type WebAction } from "../fp-express";
import type { Repository } from "../repository";

const parseNewUser = liftTE(NewUserDecoder);

export const toRawInUser = ({
  username,
  password,
  locked,
  admin
}: NewUser): Action<RawInUser> => {
  return pipe(
    TE.Do,
    TE.bind("phash", () => TE.fromTask(() => Pwd.hash(password, "bcrypt"))),
    TE.map(
      ({ phash }) =>
        <RawInUser>{
          phash,
          admin,
          username,
          locked: !!locked,
          login_attempts: 0,
          psalt: "not-in-use"
        }
    ),
    TE.chain(liftTE(RawInUserDecoder))
  );
};

export const createUser =
  (repo: Repository) =>
  (body: unknown): WebAction<GetUser> => {
    return pipe(
      TE.Do,
      TE.bind("payload", () => parseNewUser(body)),
      TE.bind("user", ({ payload }) => toRawInUser(payload)),
      TE.chain(({ user }) => repo.user.create(user)),
      mapWebError
    );
  };

export const getUser =
  (repo: Repository) =>
  (id: UserId): WebAction<GetUser> => {
    return pipe(
      repo.user.get(id),
      TE.chain(liftTE(GetUserDecoder)),
      mapWebError
    );
  };

export const getUsers =
  (repo: Repository) => (): WebAction<readonly GetUser[]> => {
    return pipe(
      repo.user.getAll(),
      TE.chain(liftTE(GetUsersDecoder)),
      mapWebError
    );
  };

export const deleteUser =
  (repo: Repository) =>
  (id: UserId): WebAction<Optional<Id>> => {
    return pipe(
      repo.user.delete(id as UserId),
      TE.map(([_, rowsDeleted]) => (rowsDeleted ? { id } : null)),
      mapWebError
    );
  };
