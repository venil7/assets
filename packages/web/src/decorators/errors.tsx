import type { AppError, Identity, Nullable } from "@darkruby/assets-core";
import React from "react";
import { Alert } from "react-bootstrap";
import { type Props } from "./fetching";

export type WithError<TProps extends Props> = Identity<
  TProps & {
    error: Nullable<AppError>;
  }
>;
export function withError<P extends Props>(
  Component: React.FC<P>
): React.FC<WithError<P>> {
  return ({ error, ...rest }: WithError<P>) =>
    error ? (
      <Alert color="danger">
        <h4 className="alert-heading">Error</h4>
        <p>{error.type}</p>
        <hr />
        <p className="mb-0">{error.message}</p>
      </Alert>
    ) : (
      <Component {...(rest as unknown as P)} />
    );
}
