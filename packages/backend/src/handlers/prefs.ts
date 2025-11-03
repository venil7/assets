import { type Prefs } from "@darkruby/assets-core";
import { type HandlerTask } from "@darkruby/fp-express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { mapWebError } from "../domain/error";
import type { Context } from "./context";

export const getPrefs: HandlerTask<Prefs, Context> = ({
  params: [, res],
  context: { repo, service },
}) =>
  pipe(service.auth.requireUserId(res), TE.chain(repo.prefs.get), mapWebError);

export const updatePrefs: HandlerTask<Prefs, Context> = ({
  params: [req, res],
  context: { repo, service },
}) =>
  pipe(
    service.auth.requireUserId(res),
    mapWebError,
    TE.chain((userId) => service.prefs.update(userId, req.body))
  );
