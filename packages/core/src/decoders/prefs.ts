import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { JsonFromString, withFallback } from "io-ts-types";

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
  "INR"
] as const;

export type Ccy = (typeof BASE_CCYS)[number] | "GBp";

export const CcyDecoder = pipe(
  BASE_CCYS as unknown as string[],
  A.map((v: string) => t.literal(v) as t.LiteralC<string>),
  (codecs) =>
    t.union(
      codecs as [
        t.LiteralC<string>,
        t.LiteralC<string>,
        ...t.LiteralC<string>[]
      ]
    )
) as t.Type<Ccy>;

const additionqlPrefsTypes = {
  altChart: withFallback(t.boolean, false)
};

export const AdditionalPrefsDecoder = t.type(additionqlPrefsTypes);
export const defaultAdditionalPrefs = (): t.TypeOf<
  typeof AdditionalPrefsDecoder
> => ({
  altChart: false
});

const prefsTypes = {
  base_ccy: CcyDecoder,
  additional: withFallback(AdditionalPrefsDecoder, defaultAdditionalPrefs())
};

const dbPrefsTypes = {
  ...prefsTypes,
  additional: t.string.pipe(JsonFromString).pipe(prefsTypes.additional)
};

export const PrefsDecoder = t.type(prefsTypes);
export const DbPrefsDecoder = t.type(dbPrefsTypes);

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
    case "INR":
      return "en-IN";
    case "USD":
    default:
      return "en-US";
  }
};
