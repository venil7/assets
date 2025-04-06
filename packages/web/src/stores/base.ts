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
};

export const createStoreBase = <T>(
  data: Signal<T>,
  dataPresent: (t: T) => boolean = (t) => !!t
): StoreBase<T> => {
  const error = signal<Nullable<AppError>>(null);
  const fetching = signal<boolean>(false);

  const run = async (action: Action<T>): Promise<Result<T>> => {
    // if (!force && dataPresent(data.peek())) {
    //   return TE.of(data.value)();
    // }
    return pipe(
      TE.fromIO(() => {
        fetching.value = true;
        error.value = null;
      }),
      TE.chain(() => action),
      TE.chainFirstIOK((value) => () => {
        // console.info("ok", value);
        fetching.value = false;
        data.value = value;
      }),
      TE.orElseW((err: AppError) => {
        // console.error(err);
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

  return { data, error, fetching, run };
};
