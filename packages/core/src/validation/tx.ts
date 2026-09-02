import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { nonEmptyArray } from "io-ts-types";
import {
  BooleanDecoder,
  PostTxDecoder,
  PostTxsUploadDecoder
} from "../decoders";
import { chainDecoder } from "../decoders/util";
import type { PostTxsUpload } from "../domain";
import { createValidator } from "./util";

export const txValidator = pipe(PostTxDecoder, createValidator);

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
      E.apS("replace", BooleanDecoder.decode(replace))
    )
  ),
  createValidator<PostTxsUpload>
);
