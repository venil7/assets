import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";
import { formatValidationErrors } from "io-ts-reporters";

export const createValidator =
  <T>(decoder: t.Decoder<any, T>) =>
  (value: any) => {
    const v = decoder.decode(value);
    return {
      get valid() {
        return E.isRight(v);
      },
      get errors() {
        return E.isLeft(v) ? formatValidationErrors(v.left) : [];
      },
    };
  };
