import * as t from "io-ts";
import type {
  EnrichedAssetDecoder,
  GetAssetDecoder,
  PostAssetDecoder,
} from "../decoders/asset";
import type {
  PeriodPriceDecoder,
  PeriodValueDecoder,
} from "../decoders/yahoo/period";

export type PostAsset = t.TypeOf<typeof PostAssetDecoder>;
export type GetAsset = t.TypeOf<typeof GetAssetDecoder>;

export type PeriodPrice = t.TypeOf<typeof PeriodPriceDecoder>;
export type PeriodValue = t.TypeOf<typeof PeriodValueDecoder>;

export type EnrichedAsset = t.TypeOf<typeof EnrichedAssetDecoder>;

export const defaultAsset = (): PostAsset => ({
  name: "",
  ticker: "",
});
