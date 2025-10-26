import * as t from "io-ts";
import type { GetPreferenceDecoder, PostPreferenceDecoder } from "../decoders";

export type PostPreference = t.TypeOf<typeof PostPreferenceDecoder>;
export type GetPreference = t.TypeOf<typeof GetPreferenceDecoder>;

export const BASE_CCYS = [
  "USD",
  "GBP",
  "EUR",
  "CAD",
  "AUD",
  "CHF",
  "SEK",
  "NOK",
];
