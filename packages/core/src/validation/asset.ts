import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { PostAssetDecoder } from "../decoders";
import { chainDecoder } from "../decoders/util";
import { createValidator, nonEmptyField } from "./util";

export const assetValidator = pipe(
  PostAssetDecoder,
  chainDecoder(({ ticker, name }) =>
    pipe(
      E.Do,
      E.apS("ticker", nonEmptyField("Asset ticker").decode(ticker)),
      E.apS("name", nonEmptyField("Asset name").decode(name))
    )
  ),
  createValidator
);
