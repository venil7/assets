import { type Id, type Optional, type Profile } from "@darkruby/assets-core";
import {
  CredenatialsDecoder,
  ProfileDecoder,
} from "@darkruby/assets-core/src/decoders/user";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import { type HandlerTask } from "@darkruby/fp-express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { toWebError } from "../domain/error";
import * as userService from "../services/auth";
import { requireProfile, requireUserId } from "./auth";
import type { Context } from "./context";

export const getProfile: HandlerTask<Profile, Context> = ({
  params: [, res],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("userId", () => requireUserId(res)),
    TE.bind("user", ({ userId }) => repo.user.get(userId)),
    TE.chain(({ user }) => liftTE(ProfileDecoder)(user)),
    TE.mapLeft(toWebError)
  );

export const updateProfile: HandlerTask<Optional<Profile>, Context> = ({
  params: [req, res],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("profile", () => requireProfile(res)),
    TE.bind("credentials", () => pipe(req.body, liftTE(CredenatialsDecoder))),
    TE.bind("user", ({ credentials, profile }) =>
      pipe(credentials, userService.toUser(profile.admin))
    ),
    TE.chain(({ user, profile }) =>
      pipe(
        repo.user.update(profile.id, user),
        TE.chain(() => repo.user.get(profile.id))
      )
    ),
    TE.mapLeft(toWebError)
  );

export const deleteProfile: HandlerTask<Optional<Id>, Context> = ({
  params: [, res],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("userId", () => requireUserId(res)),
    TE.chain(({ userId }) => repo.user.delete(userId)),
    TE.map(([userId, rowsDeleted]) => (rowsDeleted ? { id: userId } : null)),
    TE.mapLeft(toWebError)
  );
