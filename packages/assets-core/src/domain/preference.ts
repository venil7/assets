import * as t from "io-ts";
import { BASE_CCYS, type PreferencesDecoder } from "../decoders";

export type Preferences = t.TypeOf<typeof PreferencesDecoder>;

export const defaultPreferenes = (): Preferences => ({
  base_ccy: BASE_CCYS[0],
});
