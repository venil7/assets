import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { PostPortfolioDecoder } from "../decoders";
import { mapDecoder, nonEmptyString } from "../decoders/util";
import { createValidator } from "./util";

export const portfolioValidator = pipe(
  mapDecoder(PostPortfolioDecoder, ({ name }) =>
    pipe(E.Do, E.apS("name", nonEmptyString.decode(name)))
  ),
  createValidator
);
