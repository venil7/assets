import * as t from "io-ts";

const preferenceTypes = {
  base_ccy: t.string,
};

export const PostPreferenceDecoder = t.type(preferenceTypes);
export const GetPreferenceDecoder = t.type(preferenceTypes);
