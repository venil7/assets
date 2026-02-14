import {
  AppErrorType,
  GetUserDecoder,
  GetUsersDecoder,
  handleError,
  NewUserDecoder,
  PasswordChangeDecoder,
  PostUserDecoder,
  RawInUserDecoder,
  validationError,
  type Action,
  type GetUser,
  type Id,
  type NewUser,
  type Optional,
  type Profile,
  type RawInUser,
  type UserId
} from "@darkruby/assets-core";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import { notFound, type WebAction } from "@darkruby/fp-express";
import { password as Pwd } from "bun";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { mapWebError } from "../domain/error";
import type { Repository } from "../repository";
import { verifyPassword } from "./auth";

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

export const updateProfileOnly =
  (repo: Repository) =>
  (id: UserId, body: unknown): WebAction<GetUser> => {
    return pipe(
      pipe(body, liftTE(PostUserDecoder)),
      TE.chain((profile) => repo.user.updateProfileOnly(id, profile)),
      TE.chain(() => repo.user.get(id)),
      mapWebError,
      TE.filterOrElse((u): u is GetUser => Boolean(u), notFound)
    );
  };

export const updateOwnProfileOnly =
  (repo: Repository) =>
  (userId: UserId, payload: unknown): WebAction<GetUser> =>
    pipe(
      TE.Do,
      TE.bind("ownProfile", () =>
        pipe(
          repo.user.get(userId),
          TE.filterOrElse(
            (u): u is GetUser => Boolean(u),
            handleError("Profile not found", AppErrorType.Validation)
          )
        )
      ),
      TE.bind("profile", () => pipe(payload, liftTE(PostUserDecoder))),
      mapWebError,
      TE.chain(({ profile, ownProfile }) =>
        updateProfileOnly(repo)(userId, {
          ...ownProfile,
          username: profile.username
        })
      )
    );

export const updateOwnPasswordOnly =
  (repo: Repository) =>
  (profile: Profile, payload: unknown): WebAction<GetUser> =>
    pipe(
      TE.Do,
      TE.tap(() => repo.user.resetAttempts(profile.username)),
      TE.bind("user", () => repo.user.loginAttempt(profile.username)),
      TE.bind("passwordChange", () =>
        pipe(payload, liftTE(PasswordChangeDecoder))
      ),
      TE.tap(({ user, passwordChange }) =>
        pipe(
          verifyPassword(user.phash, passwordChange.oldPassword),
          TE.mapLeft(() => validationError("Wrong old password"))
        )
      ),
      TE.chain(({ user, passwordChange }) =>
        toRawInUser({
          username: user.username,
          password: passwordChange.newPassword,
          admin: user.admin,
          locked: user.locked
        })
      ),
      TE.chain((user) => repo.user.update(profile.id, user)),
      mapWebError
    );
