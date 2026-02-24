import { endOfToday } from "date-fns";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import type { Refinement } from "fp-ts/lib/Refinement";
import * as t from "io-ts";
import { NumberDecoder } from "./number";
import { chainDecoder, dateDecoder, validationErr } from "./util";

export const nonFuture = pipe(
  dateDecoder as t.Type<Date>,
  chainDecoder((d) =>
    d > endOfToday() ? E.left([validationErr(`Can't be future date`)]) : E.of(d)
  )
);

export const UnixDateDecoder = t.brand(
  NumberDecoder,
  ((a) => a >= 0 && a == Math.floor(a)) as Refinement<
    number,
    t.Branded<number, { readonly UnixDate: symbol }>
  >,
  "UnixDate"
);
