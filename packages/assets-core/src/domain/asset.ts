import * as t from "io-ts";
import type { GetAssetDecoder, PostAssetDecoder } from "../decoders/asset";

export type PostAsset = t.TypeOf<typeof PostAssetDecoder>;
export type GetAsset = t.TypeOf<typeof GetAssetDecoder>;
