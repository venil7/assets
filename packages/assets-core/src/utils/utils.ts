import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { type AppError } from "../domain/error";

export type Nullable<T> = T | null;
export type Optional<T> = Nullable<T> | undefined;
export type Identity<T> = { [P in keyof T]: T[P] };
export type Replace<T, K extends keyof T, R> = Identity<
  Omit<T, K> & { [key in K]: R }
>;

export type Result<T> = E.Either<AppError, T>;
export type Action<T> = TE.TaskEither<AppError, T>;

export const run = async <A>(test: Action<A>) => {
  const result = await test();
  if (E.isLeft(result)) {
    throw new Error(result.left.message);
  }
  return result.right;
};
