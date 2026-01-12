import { endOfToday } from "date-fns";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { dateDecoder, mapDecoder1, validationErr } from "./util";

export const nonFuture = pipe(
  dateDecoder as t.Type<Date>,
  mapDecoder1((d) =>
    d > endOfToday() ? E.left([validationErr(`Can't be negative`)]) : E.of(d)
  )
);
