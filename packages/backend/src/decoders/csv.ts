import { validationErr } from "@darkruby/assets-core/src/decoders/util";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";

export const fromCsv = <A, O = A, I = unknown>(decoder: t.Type<A, O, I>) => {
  return new t.Type<A[], string, string>(
    `fromCsv(${decoder.name})`,
    (a): a is A[] => t.array(decoder as t.Mixed).is(a),
    ((inp) => {
      return pipe(
        E.tryCatch(
          () => parse(inp, { columns: true, autoParse: true, cast: true }),
          (e) => [validationErr((e as Error).message)]
        ),
        E.chain(E.traverseArray((i) => decoder.decode(i as I)))
      );
    }) as t.Validate<string, A[]>,
    (as: A[]) => {
      return stringify(JSON.parse(JSON.stringify(as)), { header: true });
    }
  );
};
