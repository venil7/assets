import * as t from "io-ts";
import type { PreferencesDecoder } from "../decoders";

export type Preferences = t.TypeOf<typeof PreferencesDecoder>;

export const defaultPreferenes = (): Preferences => ({
  base_ccy: BASE_CCYS[0],
});

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
];
