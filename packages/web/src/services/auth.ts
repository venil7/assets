import {
  type Action,
  AppErrorType,
  generalError,
  handleError,
  type Result,
  type Token,
} from "@darkruby/assets-core";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import * as jose from "jose";

import { differenceInSeconds } from "date-fns";
import { apiFromToken } from "./api";
import { readToken, writeToken } from "./token";

const refreshToken = (): Action<Token> => {
  return pipe(
    apiFromToken,
    TE.chain(({ auth }) => auth.refreshToken()),
    TE.chainFirst(TE.fromEitherK(writeToken))
  );
};

const belowThreshold = (token: Token): Result<Token> =>
  pipe(
    E.tryCatch(
      () => jose.decodeJwt(token.token),
      handleError("Cant parse token", AppErrorType.Auth)
    ),
    E.filterOrElseW(
      ({ exp = 0 }) =>
        differenceInSeconds(new Date(exp * 1000), new Date()) >
        (token.refreshBefore ?? 0),
      () => generalError("needs refresh")
    ),
    E.map(() => token)
  );

export const refreshWhenCloseToExpiry = (): Action<Token> => {
  return pipe(
    readToken(), // read best before here
    E.chain(belowThreshold),
    TE.fromEither,
    TE.altW(refreshToken)
  );
};
