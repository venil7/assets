import { type GetUser, type Id, type Optional } from "@darkruby/assets-core";
import { type HandlerTask } from "@darkruby/fp-express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { urlUserId } from "../decoders/params";
import { mapWebError } from "../domain/error";
import type { Context } from "./context";

export const deleteUser: HandlerTask<Optional<Id>, Context> = ({
  params: [req, res],
  context: { service },
}) =>
  pipe(
    service.auth.requireAdminProfile(res),
    TE.chain(() => urlUserId(req)),
    mapWebError,
    TE.chain(service.user.delete)
  );

export const getUsers: HandlerTask<readonly GetUser[], Context> = ({
  params: [, res],
  context: { service },
}) =>
  pipe(
    service.auth.requireAdminProfile(res),
    mapWebError,
    TE.chain(() => service.user.getMany())
  );

export const getUser: HandlerTask<GetUser, Context> = ({
  params: [req, res],
  context: { service },
}) =>
  pipe(
    service.auth.requireAdminProfile(res),
    TE.chain(() => urlUserId(req)),
    mapWebError,
    TE.chain(service.user.get)
  );

export const createUser: HandlerTask<GetUser, Context> = ({
  params: [req, res],
  context: { service },
}) =>
  pipe(
    service.auth.requireAdminProfile(res),
    mapWebError,
    TE.chain(() => service.user.create(req.body))
  );

export const updateUser: HandlerTask<GetUser, Context> = ({
  params: [req, res],
  context: { service },
}) =>
  pipe(
    service.auth.requireAdminProfile(res),
    TE.chain(() => urlUserId(req)),
    mapWebError,
    TE.chain((id) => service.user.updateProfileOnly(id, req.body))
  );
