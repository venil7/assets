import type { Profile, UserId } from "@darkruby/assets-core";
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
import { getAdminProfile, getProfile } from "./auth";
import type { Context } from "./context";

export const createUser: HandlerTask<Profile, Context> = ({
  params: [req, res],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("admin", () => getAdminProfile(res)),
    TE.bind("payload", () => pipe(req.body, liftTE(CredenatialsDecoder))),
    TE.bind("user", ({ payload }) => userService.createUser()(payload)),
    TE.chain(({ user }) => repo.user.create(user)),
    TE.chain(([id]) => repo.user.get(id as UserId)),
    TE.chain(liftTE(ProfileDecoder)),
    TE.mapLeft(toWebError)
  );

export const getOwnProfile: HandlerTask<Profile, Context> = ({
  params: [, res],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("profile", () => getProfile(res)),
    TE.bind("user", ({ profile }) => repo.user.get(profile.id)),
    TE.chain(({ user }) => liftTE(ProfileDecoder)(user)),
    TE.mapLeft(toWebError)
  );

export const updateOwnProfile: HandlerTask<Profile, Context> = ({
  params: [req, res],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("profile", () => getProfile(res)),
    TE.bind("credentials", () => pipe(req.body, liftTE(CredenatialsDecoder))),
    TE.chain(({ credentials, profile }) =>
      pipe(
        credentials,
        userService.createUser(false),
        TE.chain((usr) => repo.user.update(usr, profile.id))
      )
    ),
    TE.chain(([, id]) => repo.user.get(id as UserId)),
    TE.mapLeft(toWebError)
  );
