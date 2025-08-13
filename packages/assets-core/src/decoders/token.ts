import * as t from "io-ts";
import type { Nullable } from "../utils/utils";
import { nullableDecoder } from "./util";

const tokenTypes = {
  token: t.string,
  refreshBefore: nullableDecoder(t.number) as t.Type<Nullable<number>>,
};

export const TokenDecoder = t.type(tokenTypes);
