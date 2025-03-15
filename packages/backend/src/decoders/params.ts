import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { NumberFromString } from "io-ts-types";

export const numberFromUrl = pipe(NumberFromString, liftTE);
export const stringFromUrl = pipe(t.string, liftTE);
