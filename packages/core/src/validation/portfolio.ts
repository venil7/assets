import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { PostPortfolioDecoder } from "../decoders";
import { chainDecoder } from "../decoders/util";
import { createValidator, nonEmptyField } from "./util";

export const portfolioValidator = pipe(
  PostPortfolioDecoder,
  chainDecoder(({ name }) =>
    pipe(E.Do, E.apS("name", nonEmptyField("Portfolio name").decode(name)))
  ),
  createValidator
);
