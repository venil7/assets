import * as t from "io-ts";
import { nonEmptyArray } from "io-ts-types";
import { UnixDateDecoder } from "../date";
import { CcyDecoder } from "../prefs";

const fxRecordTypes = {
  rate: t.number,
  timestamp: UnixDateDecoder
};

const fxTypes = {
  ...fxRecordTypes,
  ccy: t.string,
  base: CcyDecoder
};

export const FxRecordDecoder = t.type(fxRecordTypes);

const fxRatesDecoder = {
  ccy: t.string,
  base: CcyDecoder,
  rates: nonEmptyArray(FxRecordDecoder),
  latest: FxRecordDecoder
};

export const FxDecoder = t.type(fxTypes);
export const FxRatesDecoder = t.type(fxRatesDecoder);
