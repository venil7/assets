import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { NonEmptyString } from "io-ts-types";
import { withErrorMessage } from "./error";

export const nonEmptyString = pipe(
  NonEmptyString,
  withErrorMessage("Can't be empty")
) as unknown as t.Type<string, string, unknown>;
