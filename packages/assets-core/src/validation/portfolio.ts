import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { PostPortfolioDecoder } from "../decoders";
import { chainDecoder, nonEmptyString } from "../decoders/util";
import { createValidator } from "./util";

export const portfolioValidator = pipe(
  PostPortfolioDecoder,
  chainDecoder(({ name }) =>
    pipe(E.Do, E.apS("name", nonEmptyString.decode(name)))
  ),
  createValidator
);
