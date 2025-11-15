import {
  AppErrorType,
  type AppError,
  type Identity,
  type Nullable,
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { Alert } from "react-bootstrap";
import { Link } from "react-router";
import { Danger, Warning } from "../components/Form/Alert";
import { routes } from "../components/Router";
import { type Props } from "./fetching";
import { withNoData } from "./nodata";

export type WithError<TProps extends Props> = Identity<
  TProps & {
    error: Nullable<AppError>;
    onErrorDismiss?: () => void;
  }
>;
export function withError<P extends Props>(
  Component: React.FC<P>
): React.FC<WithError<P>> {
  return ({ error, onErrorDismiss, ...rest }: WithError<P>) =>
    error ? (
      <Error error={error} onDismiss={onErrorDismiss} />
    ) : (
      <Component {...(rest as unknown as P)} />
    );
}

export type ErrorProps = {
  error: AppError;
  onDismiss?: () => void;
};
const Error: React.FC<ErrorProps> = ({ error, onDismiss }) => {
  const dismissible = !!onDismiss;
  switch (error.type) {
    case AppErrorType.Validation:
      return (
        <Warning dismissible={dismissible} onClose={onDismiss}>
          <Alert.Heading>{error.type}</Alert.Heading>
          <p>{error.message}</p>
        </Warning>
      );
    case AppErrorType.Auth:
      return (
        <Danger dismissible={dismissible} onClose={onDismiss}>
          <Alert.Heading>{error.type}</Alert.Heading>
          <p>{error.message}</p>
          <Link to={routes.login()}>Login</Link>
        </Danger>
      );
    default:
      return (
        <Danger dismissible={dismissible} onClose={onDismiss}>
          <Alert.Heading>Error</Alert.Heading>
          <p>{error.message}</p>
        </Danger>
      );
  }
};

const EnhError = pipe(
  Error,
  withNoData((p) => p.error, <></>)
);
export { EnhError as Error };
