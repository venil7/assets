import {
  PreferencesDecoder,
  type Action,
  type Preferences,
} from "@darkruby/assets-core";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import type { UserId } from "@darkruby/assets-core/src/domain/user";
import type Database from "bun:sqlite";
import { pipe } from "fp-ts/lib/function";
import * as ID from "fp-ts/lib/Identity";
import * as TE from "fp-ts/lib/TaskEither";

import { execute, queryOne, type ExecutionResult } from "./database";

import {
  getPreferenceSql,
  updatePreferenceSql,
} from "./sql" with { type: "macro" };

const sql = {
  preference: {
    get: TE.of(getPreferenceSql()),
    update: TE.of(updatePreferenceSql()),
  },
};

export const getPreference =
  (db: Database) =>
  (userId: UserId): Action<Preferences> =>
    pipe(
      queryOne({ userId }),
      ID.ap(sql.preference.get),
      ID.ap(db),
      TE.chain(liftTE(PreferencesDecoder))
    );

export const updatePreference =
  (db: Database) =>
  (userId: UserId, preference: Preferences): Action<ExecutionResult> => {
    return pipe(
      execute({ ...preference, userId }),
      ID.ap(sql.preference.update),
      ID.ap(db)
    );
  };
