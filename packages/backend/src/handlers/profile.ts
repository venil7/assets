import { type GetUser, type Id, type Optional } from "@darkruby/assets-core";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { mapWebError } from "../domain/error";
import { type HandlerTask } from "../fp-express";
import type { Context } from "./context";

export const getProfile: HandlerTask<GetUser, Context> = ({
  params: [, res],
  context: { service }
}) =>
  pipe(
    service.auth.requireUserId(res),
    mapWebError,
    TE.chain(service.user.get)
  );

export const updateProfile: HandlerTask<GetUser, Context> = ({
  params: [req, res],
  context: { service }
}) =>
  pipe(
    TE.Do,
    TE.bind("userId", () => service.auth.requireUserId(res)),
    mapWebError,
    TE.chain(({ userId }) =>
      service.user.updateOwnProfileOnly(userId, req.body)
    )
  );

export const updatePassword: HandlerTask<GetUser, Context> = ({
  params: [req, res],
  context: { service }
}) =>
  pipe(
    TE.Do,
    TE.bind("profile", () => service.auth.requireProfile(res)),
    mapWebError,
    TE.chain(({ profile }) =>
      service.user.updateOwnPasswordOnly(profile, req.body)
    )
  );

export const deleteProfile: HandlerTask<Optional<Id>, Context> = ({
  params: [, res],
  context: { repo, service }
}) =>
  pipe(
    TE.Do,
    TE.bind("userId", () => service.auth.requireUserId(res)),
    mapWebError,
    TE.chain(({ userId }) => service.user.delete(userId))
  );
