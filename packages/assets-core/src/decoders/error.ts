import * as t from "io-ts";

const errorType = {
  type: t.string,
  message: t.string,
};

export const ErrorDecoder = t.type(errorType);

export const AnyDecoder = t.record(t.string, t.any);
