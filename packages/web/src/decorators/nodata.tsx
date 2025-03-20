import type { Identity, Nullable } from "@darkruby/assets-core";
import React from "react";
import type { Props } from "./fetching";

export type WithNoData<TProps extends Props, K extends keyof TProps> = Identity<
  { [k in K]: Nullable<TProps[K]> } & Omit<TProps, K>
>;

export function withNoData<P extends Props, K extends keyof P>(
  getter: (p: WithNoData<P, K>) => Nullable<P[K]>
) {
  return function (Component: React.FC<P>): React.FC<WithNoData<P, K>> {
    return (props: WithNoData<P, K>) =>
      getter(props) === null ? (
        <>data missing</>
      ) : (
        <Component {...(props as unknown as P)} />
      );
  };
}
