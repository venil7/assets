import { type Identity } from "@darkruby/assets-core";
import React from "react";
import { Spinner } from "react-bootstrap";

export type Props = {};

export type WithFetching<TProps extends Props> = Identity<
  TProps & { fetching: boolean }
>;

export function withFetching<P extends Props>(
  Component: React.FC<P>
): React.FC<WithFetching<P>> {
  return ({ fetching, ...rest }: WithFetching<P>) =>
    fetching ? <Spinner /> : <Component {...(rest as unknown as P)} />;
}
