import { PreferencesDecoder, type Preferences } from "@darkruby/assets-core";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import { type HandlerTask } from "@darkruby/fp-express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { toWebError } from "../domain/error";
import { getUserId } from "./auth";
import type { Context } from "./context";

export const getPreference: HandlerTask<Preferences, Context> = ({
  params: [, res],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("userId", () => getUserId(res)),
    TE.bind("preferences", ({ userId }) => repo.preference.get(userId)),
    TE.chain(({ preferences }) => liftTE(PreferencesDecoder)(preferences)),
    TE.mapLeft(toWebError)
  );

export const updatePreference: HandlerTask<Preferences, Context> = ({
  params: [req, res],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("userId", () => getUserId(res)),
    TE.bind("preference", () => pipe(req.body, liftTE(PreferencesDecoder))),
    TE.chain(({ userId, preference }) =>
      pipe(
        repo.preference.update(userId, preference),
        TE.chain(() => repo.preference.get(userId))
      )
    ),
    TE.mapLeft(toWebError)
  );
