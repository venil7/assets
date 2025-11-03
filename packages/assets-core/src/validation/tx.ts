import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { PostTxDecoder } from "../decoders";
import { mapDecoder, nonNegative } from "../decoders/util";
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
