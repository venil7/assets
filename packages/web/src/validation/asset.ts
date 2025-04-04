import { PostAssetDecoder } from "@darkruby/assets-core";
import { mapDecoder } from "@darkruby/assets-core/src/decoders/util";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { createValidator } from "../util/validation";
import { nonEmptyString } from "./util";

export const PostAssetValidation = mapDecoder(
  PostAssetDecoder,
  ({ ticker, name }) =>
    pipe(
      E.Do,
      E.apS("ticker", nonEmptyString.decode(ticker)),
      E.apS("name", nonEmptyString.decode(name))
    )
);

export const assetValidator = createValidator(PostAssetValidation);
