import { pipe } from "fp-ts/lib/function";
import { PostAssetDecoder } from "../decoders";
import { createValidator } from "./util";

export const assetValidator = pipe(PostAssetDecoder, createValidator);
