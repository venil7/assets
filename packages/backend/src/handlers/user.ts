import type { Id, Optional, Profile, UserId } from "@darkruby/assets-core";
import {
  CredenatialsDecoder,
  ProfileDecoder,
  ProfilesDecoder,
} from "@darkruby/assets-core/src/decoders/user";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import { type HandlerTask } from "@darkruby/fp-express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { numberFromUrl } from "../decoders/params";
import { toWebError } from "../domain/error";
import * as userService from "../services/auth";
import { getAdminProfile } from "./auth";
import type { Context } from "./context";

export const deleteUser: HandlerTask<Optional<Id>, Context> = ({
  params: [req, res],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("id", () => numberFromUrl(req.params.id)),
    TE.bind("admin", () => getAdminProfile(res)),
    TE.bind("delete", ({ id }) => repo.user.delete(id as UserId)),
    TE.map(({ id, delete: [_, rowsDeleted] }) => (rowsDeleted ? { id } : null)),
    TE.mapLeft(toWebError)
  );

export const getUsers: HandlerTask<Profile[], Context> = ({
  params: [, res],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("admin", () => getAdminProfile(res)),
    TE.chain(() => repo.user.getAll()),
    TE.chain(liftTE(ProfilesDecoder)),
    TE.mapLeft(toWebError)
  );

export const getUser: HandlerTask<Profile, Context> = ({
  params: [req, res],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("id", () => numberFromUrl(req.params.id)),
    TE.bind("admin", () => getAdminProfile(res)),
    TE.chain(({ id }) => repo.user.get(id as UserId)),
    TE.chain(liftTE(ProfileDecoder)),
    TE.mapLeft(toWebError)
  );

export const createUser: HandlerTask<Profile, Context> = ({
  params: [req, res],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("admin", () => getAdminProfile(res)),
    TE.bind("payload", () => pipe(req.body, liftTE(CredenatialsDecoder))),
    TE.bind("user", ({ payload }) => userService.toNonAdminUser(payload)),
    TE.chain(({ user }) => repo.user.create(user)),
    TE.chain(([id]) => repo.user.get(id as UserId)),
    TE.chain(liftTE(ProfileDecoder)),
    TE.mapLeft(toWebError)
  );

export const updateUser: HandlerTask<Profile, Context> = ({
  params: [req, res],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("admin", () => getAdminProfile(res)),
    TE.bind("id", () => numberFromUrl(req.params.id)),
    TE.bind("payload", () => pipe(req.body, liftTE(CredenatialsDecoder))),
    TE.bind("user", ({ payload }) => userService.toNonAdminUser(payload)),
    TE.bind("update", ({ id, user }) => repo.user.update(id as UserId, user)),
    TE.chain(({ id }) => repo.user.get(id as UserId)),
    TE.chain(liftTE(ProfileDecoder)),
    TE.mapLeft(toWebError)
  );
