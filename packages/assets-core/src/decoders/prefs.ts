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

const prefsTypes = {
  base_ccy: CcyDecoder,
};

export const PrefsDecoder = t.type(prefsTypes);

export const ccyToLocale = (ccy: Ccy): string => {
  switch (ccy) {
    case "GBP":
      return "en-GB";
    case "EUR":
      return "de-DE";
    case "CAD":
      return "en-CA";
    case "AUD":
      return "en-AU";
    case "CHF":
      return "de-CH";
    case "SEK":
      return "sv-SE";
    case "NOK":
      return "no-NO";
    case "DKK":
      return "da-DK";
    case "NZD":
      return "en-NZ";
    case "JPY":
      return "ja-JP";
    case "USD":
    default:
      return "en-US";
  }
};
