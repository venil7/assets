import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";

export type Validator = ReturnType<typeof createValidator>;

export const createValidator =
  <T>(decoder: t.Decoder<unknown, T>) =>
  (value: unknown) => {
    const v = decoder.decode(value);
    return {
      get errors() {
        if (E.isLeft(v)) {
          const errors = v.left.map((e) => {
            return e.message ?? "Validation error";
          });
          return errors;
        }
        return [];
      },
      get valid() {
        return E.isRight(v);
      }
    };
  };

export const defaultValidator = createValidator(t.any);
