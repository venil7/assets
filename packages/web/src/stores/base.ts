import type { Action, Nullable, Result } from "@darkruby/assets-core";
import { Signal, signal } from "@preact/signals-react";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { type AppError } from "../../../assets-core/src/domain/error";

export type StoreBase<T> = {
  error: Signal<Nullable<AppError>>;
  fetching: Signal<boolean>;
  data: Signal<T>;

  run: (action: Action<T>) => Promise<Result<T>>;
  reset: () => void;
};

export const createStoreBase = <T>(
  data: Signal<T>,
  defaultValue: () => T = () => null as T
): StoreBase<T> => {
  const error = signal<Nullable<AppError>>(null);
  const fetching = signal<boolean>(false);

  const reset = (): void => {
    error.value = null;
    fetching.value = false;
    data.value = defaultValue();
  };

  const run = async (action: Action<T>): Promise<Result<T>> => {
    return pipe(
      TE.fromIO(() => {
        fetching.value = true;
        error.value = null;
      }),
      TE.chain(() => action),
      TE.chainFirstIOK((value) => () => {
        fetching.value = false;
        data.value = value;
      }),
      TE.orElseW((err: AppError) => {
        return pipe(
          TE.fromIO(() => {
            fetching.value = false;
            error.value = err;
            return err;
          }),
          TE.swap
        );
      })
    )();
  };

  return { data, error, fetching, run, reset };
};
