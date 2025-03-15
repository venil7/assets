import * as t from "io-ts";

const tokenTypes = {
  token: t.string,
};

export const TokenDecoder = t.type(tokenTypes);
