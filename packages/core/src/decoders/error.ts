import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { EnumDecoder } from "./enum";

export enum AppErrorType {
  General = "General",
  Validation = "Validation",
  Auth = "Auth"
}

const appErrorMessage = {
  message: t.string
};

const appErrorType = {
  type: EnumDecoder(AppErrorType),
  ...appErrorMessage
};

export const AppErrorMessageDecoder = t.type(appErrorMessage);
export const AppErrorDecoder = t.type(appErrorType);

export const AnyDecoder = t.record(t.string, t.any);

export const withErrorMessage =
  (msg: string) =>
  <A>(codec: t.Type<A, any>, name: string = `WithError(${codec.name})`) => {
    return new t.Type<A, any>(
      name,
      (u) => codec.is(u),
      (i, c) =>
        pipe(
          codec.validate(i, c),
          E.mapLeft(() => [validationErr(msg)])
        ),
      (r) => codec.encode(r as any as A) as any as A
    );
  };

export const validationErr = (
  message: string,
  value: any = null
): t.ValidationError => ({
  message,
  value,
  context: []
});
