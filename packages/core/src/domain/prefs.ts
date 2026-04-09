import * as t from "io-ts";
import {
  AdditionalPrefsDecoder,
  BASE_CCYS,
  type PrefsDecoder
} from "../decoders";

export type Prefs = t.TypeOf<typeof PrefsDecoder>;
export type AdditionalPrefs = t.TypeOf<typeof AdditionalPrefsDecoder>;

export const defaultAdditional = (): AdditionalPrefs => ({
  altChart: false
});

export const defaultPrefs = (): Prefs => ({
  base_ccy: BASE_CCYS[0],
  additional: defaultAdditional()
});
