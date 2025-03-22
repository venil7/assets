import type { Identity, Nullable, Optional } from "@darkruby/assets-core";
import React from "react";
import type { Props } from "./fetching";

export type WithNoData<TProps extends Props, K extends keyof TProps> = Identity<
  { [k in K]: Nullable<TProps[K]> } & Omit<TProps, K>
>;

export function withNoData<P extends Props, K extends keyof P>(
  getter: (p: WithNoData<P, K>) => Optional<any>,
  fallback: React.ReactNode = "no data"
) {
  return function (Component: React.FC<P>): React.FC<WithNoData<P, K>> {
    return (props: WithNoData<P, K>) => {
      const r = getter(props);
      return r === null || r == undefined ? (
        <>{fallback}</>
      ) : (
        <Component {...(props as unknown as P)} />
      );
    };
  };
}
