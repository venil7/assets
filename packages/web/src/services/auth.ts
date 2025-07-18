import {
  type Action,
  authError,
  generalError,
  type Result,
  type Token,
} from "@darkruby/assets-core";
import { differenceInHours } from "date-fns";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import * as jose from "jose";

import { apiFromToken } from "./api";
import { readToken, writeToken } from "./token";

const refreshToken = (): Action<Token> => {
  return pipe(
    apiFromToken,
    TE.chain(({ auth }) => auth.refreshToken()),
    TE.chainFirst(TE.fromEitherK(writeToken))
  );
};

const belowThreshold =
  (thresholdHours: number) =>
  (token: Token): Result<Token> =>
    pipe(
      E.tryCatch(
        () => jose.decodeJwt(token.token),
        (e) => authError(`cant parse token: ${e}`)
      ),
      E.filterOrElseW(
        ({ exp }) =>
          differenceInHours(new Date((exp ?? 0) * 1000), new Date()) >
          thresholdHours,
        () => generalError("needs refresh")
      ),
      E.map(() => token)
    );

export const refreshWhenCloseToExpiry = (
  thresholdHours = 12
): Action<Token> => {
  return pipe(
    readToken(),
    E.chain(belowThreshold(thresholdHours)),
    TE.fromEither,
    TE.altW(refreshToken)
  );
};
