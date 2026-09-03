import { PostAssetDecoder } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import { createValidator } from "./util";

export const assetValidator = pipe(PostAssetDecoder, createValidator);
