import * as t from "io-ts";
import type {
  EnrichedAssetDecoder,
  GetAssetDecoder,
  PostAssetDecoder,
} from "../decoders/asset";
import type {
  PeriodChangesDecoder,
  TotalsDecoder,
} from "../decoders/yahoo/period";

export type PostAsset = t.TypeOf<typeof PostAssetDecoder>;
export type GetAsset = t.TypeOf<typeof GetAssetDecoder>;

export type PeriodChanges = t.TypeOf<typeof PeriodChangesDecoder>;
export type Totals = t.TypeOf<typeof TotalsDecoder>;

export type EnrichedAsset = t.TypeOf<typeof EnrichedAssetDecoder>;

export const defaultAsset = (): PostAsset => ({ name: "", ticker: "" });
