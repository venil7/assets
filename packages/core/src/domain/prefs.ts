import * as t from "io-ts";
import { BASE_CCYS, type PrefsDecoder } from "../decoders";

export type Prefs = t.TypeOf<typeof PrefsDecoder>;

export const defaultPrefs = (): Prefs => ({
  base_ccy: BASE_CCYS[0],
});
