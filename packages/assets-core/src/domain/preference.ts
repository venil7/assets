import * as t from "io-ts";
import type { PreferencesDecoder } from "../decoders";

export type Preferences = t.TypeOf<typeof PreferencesDecoder>;

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
