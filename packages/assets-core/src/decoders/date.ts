import { endOfToday } from "date-fns";
import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";
import { dateDecoder, mapDecoder, validationErr } from "./util";

export const nonFuture = mapDecoder(dateDecoder as t.Type<Date>, (d) =>
  d > endOfToday() ? E.left([validationErr(`Can't be negative`)]) : E.of(d)
);
