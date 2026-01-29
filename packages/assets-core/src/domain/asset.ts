import { pipe } from "fp-ts/lib/function";
import { Ord as ordNumber } from "fp-ts/lib/number";
import { contramap, reverse, type Ord } from "fp-ts/lib/Ord";
import * as t from "io-ts";
import type {
  EnrichedAssetDecoder,
  GetAssetDecoder,
  PostAssetDecoder
} from "../decoders/asset";

export type PostAsset = t.TypeOf<typeof PostAssetDecoder>;
export type GetAsset = t.TypeOf<typeof GetAssetDecoder>;

export type EnrichedAsset = t.TypeOf<typeof EnrichedAssetDecoder>;

export const defaultAsset = (): PostAsset => ({ name: "", ticker: "" });

export const byAssetChangePct: Ord<EnrichedAsset> = pipe(
  ordNumber,
  reverse,
  contramap<number, EnrichedAsset>((a) => a.ccy.changes.returnPct)
);

export type AssetId = GetAsset["id"];
