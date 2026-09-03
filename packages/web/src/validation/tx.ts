import {
  PostTxDecoder,
  PostTxsUploadDecoder,
  type PostTxsUpload
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import { createValidator } from "./util";

export const txValidator = pipe(PostTxDecoder, createValidator);

export const txsUploadValidator = pipe(
  PostTxsUploadDecoder,
  createValidator<PostTxsUpload>
);
