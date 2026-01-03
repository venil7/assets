import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { PostTxDecoder, PostTxsUploadDecoder } from "../decoders";
import {
  boolean,
  mapDecoder,
  nonEmptyArray,
  nonNegative,
} from "../decoders/util";
import type { PostTxsUpload } from "../domain";
import { createValidator } from "./util";

export const txValidator = pipe(
  mapDecoder(PostTxDecoder, ({ price, quantity }) =>
    pipe(
      E.Do,
      E.apS("price", nonNegative.decode(price)),
      E.apS("quantity", nonNegative.decode(quantity))
    )
  ),
  createValidator
);

export const txsUploadValidator = pipe(
  mapDecoder(PostTxsUploadDecoder, ({ txs, replace }) =>
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
