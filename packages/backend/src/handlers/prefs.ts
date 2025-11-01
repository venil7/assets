import { PrefsDecoder, type Prefs } from "@darkruby/assets-core";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import { type HandlerTask } from "@darkruby/fp-express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { toWebError } from "../domain/error";
import { requireUserId } from "./auth";
import type { Context } from "./context";

export const getPrefs: HandlerTask<Prefs, Context> = ({
  params: [, res],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("userId", () => requireUserId(res)),
    TE.bind("prefs", ({ userId }) => repo.prefs.get(userId)),
    TE.chain(({ prefs }) => liftTE(PrefsDecoder)(prefs)),
    TE.mapLeft(toWebError)
  );

export const updatePrefs: HandlerTask<Prefs, Context> = ({
  params: [req, res],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("userId", () => requireUserId(res)),
    TE.bind("prefs", () => pipe(req.body, liftTE(PrefsDecoder))),
    TE.chain(({ userId, prefs }) =>
      pipe(
        repo.prefs.update(userId, prefs),
        TE.chain(() => repo.prefs.get(userId))
      )
    ),
    TE.mapLeft(toWebError)
  );
