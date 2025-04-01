import type { AppError, Identity, Nullable } from "@darkruby/assets-core";
import React from "react";
import { Alert } from "react-bootstrap";
import { Danger } from "../components/Form/Alert";
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
      <Danger>
        <Alert.Heading>{error.type}</Alert.Heading>
        <p>{error.message}</p>
      </Danger>
    ) : (
      <Component {...(rest as unknown as P)} />
    );
}
