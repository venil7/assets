import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { PostAssetDecoder } from "../decoders";
import { mapDecoder, nonEmptyString } from "../decoders/util";
import { createValidator } from "./util";

export const assetValidator = pipe(
  mapDecoder(PostAssetDecoder, ({ ticker, name }) =>
    pipe(
      E.Do,
      E.apS("ticker", nonEmptyString.decode(ticker)),
      E.apS("name", nonEmptyString.decode(name))
    )
  ),
  createValidator
);
