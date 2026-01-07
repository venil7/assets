import {
  UserIdDecoder,
  type Action,
  type AssetId,
  type PortfolioId,
  type TxId,
} from "@darkruby/assets-core";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import { RangeDecoder } from "@darkruby/assets-core/src/decoders/yahoo/meta";
import type { RequestHandler } from "express";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { NumberFromString, withFallback } from "io-ts-types";

const numberFromUrl = pipe(NumberFromString, liftTE);
export const stringFromUrl = pipe(t.string, liftTE);
export const rangeFromUrl = pipe(withFallback(RangeDecoder, "1d"), liftTE);
export const userIdFromUrl = pipe(NumberFromString.pipe(UserIdDecoder), liftTE);

type Req = Parameters<RequestHandler>[0];
export const urlPortfolioId = (req: Req): Action<PortfolioId> =>
  numberFromUrl(req.params.portfolio_id);
export const urlAssetId = (req: Req): Action<AssetId> =>
  numberFromUrl(req.params.asset_id);
export const urlTxId = (req: Req): Action<TxId> =>
  numberFromUrl(req.params.tx_id);
