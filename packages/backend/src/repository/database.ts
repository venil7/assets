import { handleError, type Action, type Nullable } from "@darkruby/assets-core";
import { Database, type SQLQueryBindings } from "bun:sqlite";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";

export type ExecutionResult = [lastId: number, rows: number];
export const defaultExecutionResult = (): ExecutionResult => [-1, 0];

export const queryMany =
  <R>(bindings: SQLQueryBindings = null) =>
  (sql: Action<string>) =>
  (db: Database): Action<R[]> => {
    return pipe(
      sql,
      TE.chain((sql) =>
        TE.tryCatch(
          async () => db.query<R, SQLQueryBindings>(sql).all(bindings),
          handleError()
        )
      )
    );
  };

export const queryOne =
  <R>(bindings: SQLQueryBindings = null) =>
  (sql: Action<string>) =>
  (db: Database): Action<Nullable<R>> => {
    return pipe(
      sql,
      TE.chain((sql) =>
        TE.tryCatch(
          async () => db.query<R, SQLQueryBindings>(sql).get(bindings),
          handleError()
        )
      )
    );
  };

export const transaction =
  <R>(insideTransaction: () => R) =>
  (db: Database): Action<Nullable<R>> => {
    const transact = db.transaction<any[], R>(insideTransaction);
    return pipe(TE.tryCatch(async () => transact(), handleError()));
  };

export const execute =
  <R>(bindings: SQLQueryBindings = null) =>
  (sql: Action<string>) =>
  (db: Database): Action<ExecutionResult> => {
    return pipe(
      sql,
      TE.chain((sql) =>
        TE.tryCatch(
          async () => db.query<R, SQLQueryBindings>(sql).run(bindings),
          handleError()
        )
      ),
      TE.map(
        ({ changes, lastInsertRowid }) =>
          [Number(lastInsertRowid), changes] as const
      )
    );
  };
