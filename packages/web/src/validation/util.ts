import {
  mapDecoder,
  validationErr,
} from "@darkruby/assets-core/src/decoders/util";
import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";

export const nonEmptyString = mapDecoder(t.string, (s) =>
  s.trim() === "" ? E.left([validationErr(`cant be empty`)]) : E.of(s)
);

export const nonNegative = mapDecoder(t.number, (n) =>
  n <= 0 ? E.left([validationErr(`cant be empty`)]) : E.of(n)
);
