import {
  AppErrorType,
  handleError,
  PasswordChangeDecoder,
  PostUserDecoder,
  validationError,
  type GetUser,
  type Profile,
  type UserId
} from "@darkruby/assets-core";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { mapWebError } from "../domain/error";
import { notFound, type WebAction } from "../fp-express";
import type { Repository } from "../repository";
import { verifyPassword } from "./auth";
import { toRawInUser } from "./user";

export const updateProfile =
  (repo: Repository) =>
  (id: UserId, payload: unknown): WebAction<GetUser> => {
    return pipe(
      pipe(payload, liftTE(PostUserDecoder)),
      TE.chain((profile) => repo.user.updateProfileOnly(id, profile)),
      TE.chain(() => repo.user.get(id)),
      mapWebError,
      TE.filterOrElse((u): u is GetUser => Boolean(u), notFound)
    );
  };

export const updateOwnProfile =
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
        updateProfile(repo)(userId, {
          ...ownProfile,
          username: profile.username
        })
      )
    );

export const updateOwnPassword =
  (repo: Repository) =>
  (profile: Profile, payload: unknown): WebAction<GetUser> =>
    pipe(
      TE.Do,
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

export const updatePassword =
  (repo: Repository) =>
  (userId: UserId, payload: unknown): WebAction<GetUser> =>
    pipe(
      TE.Do,
      TE.bind("profile", () =>
        pipe(
          repo.user.get(userId),
          TE.filterOrElse(
            (u): u is GetUser => Boolean(u),
            handleError("Profile not found", AppErrorType.Validation)
          )
        )
      ),
      TE.bind("user", ({ profile }) =>
        repo.user.loginAttempt(profile.username)
      ),
      TE.bind("passwordChange", () =>
        pipe(payload, liftTE(PasswordChangeDecoder))
      ),
      TE.chain(({ user, passwordChange }) =>
        toRawInUser({
          username: user.username,
          password: passwordChange.newPassword,
          admin: user.admin,
          locked: user.locked
        })
      ),
      TE.chain((rawUser) => repo.user.update(userId, rawUser)),
      mapWebError
    );
