import { Signal, signal } from "@preact/signals-react";
import { chain, chainFirstIOK, fromIO, orElseW } from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { AppError } from "../../../assets-core/src/domain/error";
import { Action, Nullable } from "../../../assets-core/src/domain/utils";

export type StoreBase<T> = {
  error: Signal<Nullable<AppError>>;
  fetching: Signal<boolean>;
  data: Signal<T>;

  update: (action: Action<T>) => Promise<unknown>;
};

export const createStoreBase = <T>(data: Signal<T>): StoreBase<T> => {
  const error = signal<Nullable<AppError>>(null);
  const fetching = signal<boolean>(false);

  const update = async (action: Action<T>): Promise<unknown> => {
    return pipe(
      fromIO(() => {
        fetching.value = true;
        error.value = null;
      }),
      chain(() => action),
      chainFirstIOK((value) => () => {
        fetching.value = false;
        data.value = value;
      }),
      orElseW((err) => {
        return fromIO(() => {
          fetching.value = false;
          error.value = err;
        });
      })
    )();
  };

  return {
    error,
    fetching,
    data,
    update,
  };
};
