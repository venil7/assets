import * as t from "io-ts";

const appErrorType = {
  type: t.string,
  message: t.string,
};

export const AppErrorDecoder = t.type(appErrorType);

export const AnyDecoder = t.record(t.string, t.any);
