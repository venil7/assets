import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";

export const BASE_CCYS = [
  "USD",
  "GBP",
  "EUR",
  "CAD",
  "AUD",
  "CHF",
  "SEK",
  "NOK",
  "DKK",
  "NZD",
  "JPY",
] as const;

export type Ccy = (typeof BASE_CCYS)[number];

export const CcyDecoder = pipe(
  BASE_CCYS as unknown as string[],
  A.map((v: string) => t.literal(v) as t.LiteralC<string>),
  (codecs) =>
    t.union(
      codecs as [
        t.LiteralC<string>,
        t.LiteralC<string>,
        ...t.LiteralC<string>[],
      ]
    )
) as t.Type<Ccy>;

const prefssTypes = {
  base_ccy: CcyDecoder,
};

export const PrefsDecoder = t.type(prefssTypes);
