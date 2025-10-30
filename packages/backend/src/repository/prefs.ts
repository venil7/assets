import { PrefsDecoder, type Action, type Prefs } from "@darkruby/assets-core";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import type { UserId } from "@darkruby/assets-core/src/domain/user";
import type Database from "bun:sqlite";
import { pipe } from "fp-ts/lib/function";
import * as ID from "fp-ts/lib/Identity";
import * as TE from "fp-ts/lib/TaskEither";
import { execute, queryOne, type ExecutionResult } from "./database";
import { getPrefsSql, updatePrefsSql } from "./sql" with { type: "macro" };

const sql = {
  prefs: {
    get: TE.of(getPrefsSql()),
    update: TE.of(updatePrefsSql()),
  },
};

export const getPrefs =
  (db: Database) =>
  (userId: UserId): Action<Prefs> =>
    pipe(
      queryOne({ userId }),
      ID.ap(sql.prefs.get),
      ID.ap(db),
      TE.chain(liftTE(PrefsDecoder))
    );

export const updatePrefs =
  (db: Database) =>
  (userId: UserId, prefs: Prefs): Action<ExecutionResult> => {
    return pipe(
      execute({ ...prefs, userId }),
      ID.ap(sql.prefs.update),
      ID.ap(db)
    );
  };
