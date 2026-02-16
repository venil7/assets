import type { FunctionN } from "fp-ts/lib/function";
import { defined, type Optional } from "./utils";

export const maybe =
  <P, R>(func: FunctionN<[P], R>): FunctionN<[Optional<P>], Optional<R>> =>
  (p: Optional<P>) =>
    defined(p) ? func(p) : undefined;
