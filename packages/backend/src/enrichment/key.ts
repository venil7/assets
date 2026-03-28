import { defined, type Optional } from "@darkruby/assets-core";

export const keys = <T extends any>(prefix: string) => {
  const key = (t: NonNullable<T>) => `${prefix}-${JSON.stringify(t)}`;
  const maybeKey = (t: Optional<T>) => (defined(t) ? key(t) : `-`);
  const multiKey = (ts: NonNullable<T>[]) =>
    `${prefix}s-${ts.map(key).join("-")}`;

  return { key, maybeKey, multiKey };
};
