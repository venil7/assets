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
import { getUserId } from "./auth";
import type { Context } from "./context";

export const getOwnProfile: HandlerTask<Profile, Context> = ({
  params: [, res],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("userId", () => getUserId(res)),
    TE.bind("user", ({ userId }) => repo.user.get(userId)),
    TE.chain(({ user }) => liftTE(ProfileDecoder)(user)),
    TE.mapLeft(toWebError)
  );

export const updateOwnProfile: HandlerTask<Profile, Context> = ({
  params: [req, res],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("userId", () => getUserId(res)),
    TE.bind("credentials", () => pipe(req.body, liftTE(CredenatialsDecoder))),
    TE.bind("usr", ({ credentials }) =>
      userService.toNonAdminUser(credentials)
    ),
    TE.chain(({ usr, userId }) =>
      pipe(
        repo.user.update(userId, usr),
        TE.chain(() => repo.user.get(userId))
      )
    ),
    TE.mapLeft(toWebError)
  );
