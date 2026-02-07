import { defined, type Optional } from "@darkruby/assets-core";
import type { FunctionN } from "fp-ts/lib/function";

export type RestParams<T extends (...args: any) => string> =
  Parameters<T> extends [any, ...infer R] ? R : never;

export const maybe =
  <P, R>(func: FunctionN<[P], R>): FunctionN<[Optional<P>], Optional<R>> =>
  (p: Optional<P>) =>
    defined(p) ? func(p) : undefined;

export const fallback = <F extends (...args: any) => string>(
  func: F,
  nodata = "-"
) => {
  return (
    p: Optional<Parameters<typeof func>[0]>,
    ...r: RestParams<typeof func>
  ): string => (!defined(p) ? nodata : func(p, ...r));
};
