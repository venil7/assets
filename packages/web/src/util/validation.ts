import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";

export const createValidator =
  <T>(decoder: t.Decoder<any, T>) =>
  (value: any) => {
    const v = decoder.decode(value);
    return {
      get errors() {
        if (E.isLeft(v)) {
          const errors = v.left.map((e) => e.message ?? "error");
          return errors;
        }
        return [];
      },
      get valid() {
        return E.isRight(v);
      },
    };
  };
