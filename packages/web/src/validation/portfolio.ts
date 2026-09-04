import { PostPortfolioDecoder } from "@darkruby/assets-core/src/decoders";
import { pipe } from "fp-ts/lib/function";
import { createValidator } from "./util";

export const portfolioValidator = pipe(PostPortfolioDecoder, createValidator);
