import type { Profile } from "@darkruby/assets-core";
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
import { getProfile } from "./auth";
import type { Context } from "./context";

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
    TE.bind("usr", ({ credentials }) =>
      userService.toNonAdminUser(credentials)
    ),
    TE.chain(({ usr, profile }) =>
      pipe(
        repo.user.update(profile.id, usr),
        TE.chain(() => repo.user.get(profile.id))
      )
    ),
    TE.mapLeft(toWebError)
  );
