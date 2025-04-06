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
import { type Props } from "./fetching";
import { withNoData } from "./nodata";

export type WithError<TProps extends Props> = Identity<
  TProps & {
    error: Nullable<AppError>;
  }
>;
export function withError<P extends Props>(
  Component: React.FC<P>
): React.FC<WithError<P>> {
  return ({ error, ...rest }: WithError<P>) =>
    error ? <Error error={error} /> : <Component {...(rest as unknown as P)} />;
}

const Error: React.FC<{ error: AppError }> = ({ error }) => {
  switch (error.type) {
    case AppErrorType.Validation:
      return (
        <Warning>
          <Alert.Heading>{error.type}</Alert.Heading>
          <p>{error.message}</p>
        </Warning>
      );
    default:
      return (
        <Danger>
          <Alert.Heading>{error.type}</Alert.Heading>
          <p>{error.message}</p>
          {error.type === AppErrorType.Auth ? (
            <Link to="/login">Login</Link>
          ) : null}
        </Danger>
      );
  }
};

const EnhError = pipe(
  Error,
  withNoData((p) => p.error, <></>)
);
export { EnhError as Error };
