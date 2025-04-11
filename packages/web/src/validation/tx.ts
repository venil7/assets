import { PostTxDecoder } from "@darkruby/assets-core";
import { mapDecoder } from "@darkruby/assets-core/src/decoders/util";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { createValidator } from "../util/validation";
import { nonNegative } from "./util";

export const PostTxValidation = mapDecoder(
  PostTxDecoder,
  ({ price, quantity, date }) =>
    pipe(
      E.Do,
      // E.apS("date", dateDecoder.decode((date as Date).toISOString())),
      E.apS("price", nonNegative.decode(price)),
      E.apS("quantity", nonNegative.decode(quantity))
    )
);

export const txValidator = createValidator(PostTxValidation);
