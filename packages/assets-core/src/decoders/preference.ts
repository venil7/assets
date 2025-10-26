import * as t from "io-ts";

const preferencesTypes = {
  base_ccy: t.string,
};

export const PreferencesDecoder = t.type(preferencesTypes);
