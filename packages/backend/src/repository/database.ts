import {
  generalError,
  type Action,
  type Nullable,
} from "@darkruby/assets-core";
import { Database, type SQLQueryBindings } from "bun:sqlite";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";

export type ExecutionResult = [lastId: number, rows: number];

export const queryMany =
  <R>(sql: string, bindings: SQLQueryBindings = null) =>
  (db: Database): Action<R[]> => {
    return pipe(
      TE.tryCatch(
        async () => db.query<R, SQLQueryBindings>(sql).all(bindings),
        (e) => generalError(`${e}`)
      )
    );
  };

export const queryOne =
  <R>(sql: string, bindings: SQLQueryBindings = null) =>
  (db: Database): Action<Nullable<R>> => {
    return pipe(
      TE.tryCatch(
        async () => db.query<R, SQLQueryBindings>(sql).get(bindings),
        (e) => generalError(`${e}`)
      )
    );
  };

export const execute =
  <R>(sql: string, bindings: SQLQueryBindings = null) =>
  (db: Database): Action<ExecutionResult> => {
    return pipe(
      TE.tryCatch(
        async () => db.query<R, SQLQueryBindings>(sql).run(bindings),
        (e) => generalError(`${e}`)
      ),
      TE.map(
        ({ changes, lastInsertRowid }) =>
          [lastInsertRowid as number, changes] as const
      )
    );
  };
