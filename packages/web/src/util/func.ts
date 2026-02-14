import { defined, type Optional } from "@darkruby/assets-core";

export type RestParams<T extends (...args: any) => string> =
  Parameters<T> extends [any, ...infer R] ? R : never;

export const fallback = <F extends (...args: any) => string>(
  func: F,
  nodata = "-"
) => {
  return (
    p: Optional<Parameters<typeof func>[0]>,
    ...r: RestParams<typeof func>
  ): string => (!defined(p) ? nodata : func(p, ...r));
};
