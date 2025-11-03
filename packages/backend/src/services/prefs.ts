import { PrefsDecoder, type Prefs, type UserId } from "@darkruby/assets-core";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import type { WebAction } from "@darkruby/fp-express";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import { mapWebError } from "../domain/error";
import type { Repository } from "../repository";

const prefsDecoder = liftTE(PrefsDecoder);

export const updatePrefs =
  (repo: Repository) =>
  (userId: UserId, payload: unknown): WebAction<Prefs> => {
    return pipe(
      prefsDecoder(payload),
      TE.chain((prefs) => repo.prefs.update(userId, prefs)),
      mapWebError
    );
  };
