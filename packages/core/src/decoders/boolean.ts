import * as t from "io-ts";
import { BooleanFromNumber, BooleanFromString } from "io-ts-types";

export const BooleanDecoder = t.union([
  t.boolean,
  BooleanFromNumber,
  BooleanFromString
]);
