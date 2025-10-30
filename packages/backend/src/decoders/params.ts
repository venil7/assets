import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import { RangeDecoder } from "@darkruby/assets-core/src/decoders/yahoo/meta";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { NumberFromString, withFallback } from "io-ts-types";

export const numberFromUrl = pipe(NumberFromString, liftTE);
export const stringFromUrl = pipe(t.string, liftTE);
export const rangeFromUrl = pipe(withFallback(RangeDecoder, "1d"), liftTE);
