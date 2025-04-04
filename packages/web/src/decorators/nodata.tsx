import type { Identity, Nullable, Optional } from "@darkruby/assets-core";
import React from "react";
import { Alert } from "react-bootstrap";
import type { Props } from "./fetching";

export type WithNoData<TProps extends Props, K extends keyof TProps> = Identity<
  { [k in K]: Nullable<TProps[K]> } & Omit<TProps, K>
>;

export function withNoData<P extends Props, K extends keyof P>(
  getter: (p: WithNoData<P, K>) => Optional<any>,
  fallback: React.ReactNode = <Alert>No data to show..</Alert>
) {
  return function (Component: React.FC<P>): React.FC<WithNoData<P, K>> {
    return (props: WithNoData<P, K>) => {
      const r = getter(props);
      return r === null || r == undefined ? (
        fallback
      ) : (
        <Component {...(props as unknown as P)} />
      );
    };
  };
}

export function withCondition<P extends Props>(
  condition: (p: P) => boolean,
  onConditions: (p: P) => React.ReactNode
) {
  return function (Component: React.FC<P>): React.FC<P> {
    return (props: P) => {
      const c = condition(props);
      if (!c) {
        return onConditions(props as P);
      }
      return <Component {...(props as unknown as P)} />;
    };
  };
}

export type WithVisibility<TProps extends Props> = Identity<
  TProps & { hidden?: boolean }
>;
export function withVisibility<P extends Props>() {
  return function (Component: React.FC<P>): React.FC<WithVisibility<P>> {
    return ({ hidden, ...props }: WithVisibility<P>) => {
      if (hidden) {
        return null;
      }
      return <Component {...(props as unknown as P)} />;
    };
  };
}
