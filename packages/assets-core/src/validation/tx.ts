import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { nonEmptyArray } from "io-ts-types";
import { PostTxDecoder, PostTxsUploadDecoder } from "../decoders";
import { nonFuture } from "../decoders/date";
import { boolean, chainDecoder, nonNegative } from "../decoders/util";
import type { PostTxsUpload } from "../domain";
import { createValidator } from "./util";

export const txValidator = pipe(
  PostTxDecoder,
  chainDecoder(({ price, quantity, date }) =>
    pipe(
      E.Do,
      E.apS("price", nonNegative.decode(price)),
      E.apS("quantity", nonNegative.decode(quantity)),
      E.apS("date", nonFuture.decode(date))
    )
  ),
  createValidator
);

export const txsUploadValidator = pipe(
  PostTxsUploadDecoder,
  chainDecoder(({ txs, replace }) =>
    pipe(
      E.Do,
      E.apS(
        "txs",
        nonEmptyArray(
          PostTxDecoder,
          `List of transactions can not be empty`
        ).decode(txs)
      ),
      E.apS("replace", boolean.decode(replace))
    )
  ),
  createValidator<PostTxsUpload>
);
