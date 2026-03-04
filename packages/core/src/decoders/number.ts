import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { NumberFromString } from "io-ts-types";
import { chainDecoder, validationErr } from "./util";

export const NumberDecoder = t.union([NumberFromString, t.number]);

export const nonNegative = pipe(
  NumberDecoder as t.Type<number>,
  chainDecoder((n) =>
    n <= 0 ? E.left([validationErr(`Can't be zero or less`)]) : E.of(n)
  )
);
