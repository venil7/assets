import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { PostAssetDecoder } from "../decoders";
import { chainDecoder, nonEmptyString } from "../decoders/util";
import { createValidator } from "./util";

export const assetValidator = pipe(
  PostAssetDecoder,
  chainDecoder(({ ticker, name }) =>
    pipe(
      E.Do,
      E.apS("ticker", nonEmptyString.decode(ticker)),
      E.apS("name", nonEmptyString.decode(name))
    )
  ),
  createValidator
);
