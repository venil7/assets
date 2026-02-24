import * as t from "io-ts";
import { UnixDateDecoder } from "../date";
import { CcyDecoder } from "../prefs";

const fxTypes = {
  ccy: t.string,
  base: CcyDecoder,
  rate: t.number,
  time: UnixDateDecoder
};

export const FxDecoder = t.type(fxTypes);
