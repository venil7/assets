import { pipe } from "fp-ts/lib/function";
import { PostPortfolioDecoder } from "../decoders";
import { createValidator } from "./util";

export const portfolioValidator = pipe(PostPortfolioDecoder, createValidator);
