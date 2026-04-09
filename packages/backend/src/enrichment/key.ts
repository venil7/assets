export const key =
  (prefix: string) =>
  <T extends any>(t: NonNullable<T>) =>
    `${prefix}-${JSON.stringify(t)}`;
// export const keys = <T extends any>(prefix: string) => {
//   const maybeKey = (t: Optional<T>) => (defined(t) ? key(t) : `-`);
//   const multiKey = (ts: NonNullable<T>[]) =>
//     `${prefix}s-${ts.map(key).join("-")}`;

//   return { key, maybeKey, multiKey };
// };
