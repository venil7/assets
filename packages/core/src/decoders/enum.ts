import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";

export const EnumDecoder = <TEnum extends string>(enumObj: {
  [k in string]: TEnum;
}): t.Type<TEnum, string> =>
  pipe(
    Object.values(enumObj) as string[],
    A.map((v: string) => t.literal(v) as t.Mixed),
    (codecs) => t.union(codecs as [t.Mixed, t.Mixed, ...t.Mixed[]])
  );
