import * as t from "io-ts";
import { CcyDecoder } from "../prefs";
import { UnixDateDecoder } from "./period";

const fxTypes = {
  ccy: t.string,
  base: CcyDecoder,
  rate: t.number,
  time: UnixDateDecoder
};

export const FxDecoder = t.type(fxTypes);
