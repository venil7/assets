import * as t from "io-ts";
import { NumberFromString } from "io-ts-types";

export const NumberDecoder = t.union([NumberFromString, t.number]);
